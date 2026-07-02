// ============================================================
// DevMind — YouTubeBlock Component
// Paste a YouTube URL, embed player + add timestamped notes.
// 4px left border: red-500.
// ============================================================

import React, { useState, useCallback } from "react";
import type { Block } from "../../types";
import { useBlocks } from "../../hooks/useBlocks";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { useAppStore } from "../../store/appStore";

interface YouTubeBlockProps {
  block: Block;
  onDeleted?: () => void;
}

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export const YouTubeBlock: React.FC<YouTubeBlockProps> = ({ block, onDeleted }) => {
  const [url, setUrl] = useState(block.sourceUrl || "");
  const [note, setNote] = useState(block.content);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { update, remove, togglePin } = useBlocks();
  const setSelectedBlockId = useAppStore((s) => s.setSelectedBlockId);

  const videoId = block.sourceUrl ? getYouTubeId(block.sourceUrl) : null;

  const handleSaveUrl = useCallback(async () => {
    if (!url.trim()) return;
    setSaving(true);
    await update(block.id!, {
      sourceUrl: url,
      sourceTitle: `YouTube: ${url}`,
    });
    setSaving(false);
  }, [url, update, block.id]);

  const handleSaveNote = useCallback(async () => {
    setSaving(true);
    await update(block.id!, { content: note });
    setSaving(false);
  }, [note, update, block.id]);

  const handleDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    await remove(block.id!);
    setShowDeleteModal(false);
    onDeleted?.();
  }, [block.id, remove, onDeleted]);

  return (
    <div
      className="animate-block-in group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border-strong transition-colors duration-150 border-l-4 border-l-red-500"
      onClick={() => setSelectedBlockId(block.id ?? null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge type="youtube_note" />
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

      {/* URL input (when no video yet) */}
      {!block.sourceUrl && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2">
            <input
              id={`yt-block-url-${block.id}`}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveUrl()}
              placeholder="https://youtube.com/watch?v=..."
              autoFocus
              className="flex-1 bg-transparent text-sm text-text-body placeholder:text-text-muted border-none outline-none"
            />
            <Button variant="danger" size="sm" onClick={handleSaveUrl} isLoading={saving} disabled={!url.trim()}>
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Embedded player */}
      {videoId && (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Notes textarea */}
      <div className="px-4 py-3">
        <textarea
          id={`yt-block-note-${block.id}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={handleSaveNote}
          placeholder="Add timestamped notes here... e.g. 3:42 — explanation of JWT signature"
          rows={3}
          className="w-full bg-transparent text-sm text-text-body placeholder:text-text-muted border-none outline-none leading-relaxed resize-none"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="px-4 py-2 text-[11px] text-text-muted border-t border-border">
        {new Date(block.updatedAt).toLocaleString()}
        {block.syncStatus === "pending" && (
          <span className="ml-2 text-accent-amber">● pending sync</span>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete YouTube Note"
        message="Are you sure you want to delete this YouTube note?"
      />
    </div>
  );
};
