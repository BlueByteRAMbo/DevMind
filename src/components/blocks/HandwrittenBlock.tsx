// ============================================================
// DevMind — HandwrittenBlock Component
// Two entry points: Take Photo (camera) + Upload Image.
// Both trigger the same OCR pipeline.
// 4px left border: accent-amber.
// ============================================================

import React, { useState, useCallback, useRef } from "react";
import type { Block } from "../../types";
import { useBlocks } from "../../hooks/useBlocks";
import { useImageUpload } from "../../hooks/useImageUpload";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useAppStore } from "../../store/appStore";

interface HandwrittenBlockProps {
  block: Block;
  onDeleted?: () => void;
}

export const HandwrittenBlock: React.FC<HandwrittenBlockProps> = ({
  block,
  onDeleted,
}) => {
  const [ocrText, setOcrText] = useState(block.ocrText || "");
  const [imageUrl, setImageUrl] = useState(block.imageUrl || "");
  const [editingOcr, setEditingOcr] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { update, remove, togglePin } = useBlocks();
  const { upload, uploading, error: uploadError } = useImageUpload();
  const setSelectedBlockId = useAppStore((s) => s.setSelectedBlockId);

  const handleFile = useCallback(
    async (file: File) => {
      if (!block.id) return;

      // Immediately show a local preview while uploading
      const localPreview = URL.createObjectURL(file);
      setImageUrl(localPreview);

      const { imageUrl: remoteUrl, ocrText: text } = await upload(
        file,
        block.id
      );

      if (remoteUrl) {
        setImageUrl(remoteUrl);
        setOcrText(text || "");
        await update(block.id, {
          imageUrl: remoteUrl,
          ocrText: text || "",
        });
      }
    },
    [block.id, upload, update]
  );

  const handleDelete = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete this block?")) {
      await remove(block.id!);
      onDeleted?.();
    }
  }, [block.id, remove, onDeleted]);

  const handleOcrSave = useCallback(async () => {
    await update(block.id!, { ocrText });
    setEditingOcr(false);
  }, [block.id, ocrText, update]);

  return (
    <div
      className="animate-block-in group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border-strong transition-colors duration-150 border-l-4 border-l-accent-amber"
      onClick={() => setSelectedBlockId(block.id ?? null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-accent-amber/5">
        <div className="flex items-center gap-2">
          <Badge type="handwritten_scan" />
          {block.isPinned && <span className="text-[10px] text-accent-amber">📌</span>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); togglePin(block.id!); }}
            className="p-1.5 rounded-md text-text-muted hover:text-accent-amber hover:bg-bg-hover transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill={block.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="p-1.5 rounded-md text-text-muted hover:text-accent-red hover:bg-bg-hover transition-colors"
          >
            <svg className="w-3.5 h-3.5 icon-glow hover-icon-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Upload buttons (shown when no image yet, or as overlay) */}
      {!imageUrl && (
        <div className="px-4 py-4 flex flex-col sm:flex-row gap-3 border-b border-border">
          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {/* Take Photo — larger on mobile */}
          <Button
            id={`hw-camera-${block.id}`}
            variant="amber"
            size="lg"
            className="flex-1 sm:text-sm text-base"
            leftIcon={
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
            isLoading={uploading}
          >
            Take Photo
          </Button>

          {/* Upload Image */}
          <Button
            id={`hw-upload-${block.id}`}
            variant="secondary"
            size="lg"
            className="flex-1"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            isLoading={uploading}
          >
            Upload Image
          </Button>
        </div>
      )}

      {uploadError && (
        <div className="px-4 py-2 text-sm text-accent-red border-b border-border">
          {uploadError}
        </div>
      )}

      {/* Two-column layout: image + OCR text */}
      {imageUrl && (
        <div className="flex flex-col md:flex-row gap-0 md:divide-x md:divide-border">
          {/* Left: image thumbnail */}
          <div className="md:w-1/3 p-3 flex flex-col gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block"
            >
              <img
                src={imageUrl}
                alt="Handwritten scan"
                className="w-full rounded-lg object-cover border border-border max-h-48 md:max-h-full"
              />
            </a>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-accent-amber hover:text-accent-amber/80 text-center"
            >
              View full size ↗
            </a>
            {/* Re-upload buttons below thumbnail */}
            <div className="flex gap-1.5 mt-1">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <Button variant="amber" size="sm" className="flex-1 text-[11px]"
                onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                📷 Retake
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-[11px]"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                ↑ Replace
              </Button>
            </div>
          </div>

          {/* Right: OCR text */}
          <div className="flex-1 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Extracted Text</span>
              {uploading && <Spinner size="sm" />}
              {!uploading && !editingOcr && (
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingOcr(true); }}
                  className="text-[11px] text-accent-purple hover:text-accent-purple2 transition-colors"
                >
                  {ocrText ? "Edit" : "Add Text"}
                </button>
              )}
            </div>

            {uploading ? (
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Spinner size="sm" />
                <span>Running OCR...</span>
              </div>
            ) : editingOcr ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  rows={6}
                  className="w-full bg-bg-hover border border-border rounded-md text-sm text-text-body p-2 outline-none focus:ring-1 focus:ring-accent-purple font-mono leading-relaxed"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-1.5 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setEditingOcr(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleOcrSave}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-body leading-relaxed whitespace-pre-wrap font-mono">
                {ocrText || (
                  <span className="text-text-muted italic">
                    No text extracted yet.
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-2 text-[11px] text-text-muted border-t border-border">
        {new Date(block.updatedAt).toLocaleString()}
        {block.syncStatus === "pending" && (
          <span className="ml-2 text-accent-amber">● pending sync</span>
        )}
      </div>
    </div>
  );
};
