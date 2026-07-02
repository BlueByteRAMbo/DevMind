import React, { useState, useCallback } from "react";
import type { Block } from "../../types";
import { useBlocks } from "../../hooks/useBlocks";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { useAppStore } from "../../store/appStore";

interface LinkBlockProps {
  block: Block;
  onDeleted?: () => void;
}

export const LinkBlock: React.FC<LinkBlockProps> = ({ block, onDeleted }) => {
  const [url, setUrl] = useState(block.sourceUrl || "");
  const [title, setTitle] = useState(block.sourceTitle || "");
  const [isEditing, setIsEditing] = useState(!block.sourceUrl);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { update, remove, togglePin } = useBlocks();
  const setSelectedBlockId = useAppStore((s) => s.setSelectedBlockId);

  const handleSave = useCallback(async () => {
    if (!url.trim()) return;
    setSaving(true);
    await update(block.id!, {
      sourceUrl: url,
      sourceTitle: title || url, // fallback to URL if no title
    });
    setSaving(false);
    setIsEditing(false);
  }, [url, title, update, block.id]);

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
      className="animate-block-in group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border-strong transition-colors duration-150 border-l-4 border-l-cyan-500"
      onClick={() => setSelectedBlockId(block.id ?? null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-cyan-500/5">
        <div className="flex items-center gap-2">
          <Badge type="link" />
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
          {!isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="p-1.5 rounded-md text-text-muted hover:text-text-body hover:bg-bg-hover transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
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

      {/* Content */}
      <div className="px-4 py-3">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Link Title (e.g. React Documentation)"
              className="w-full bg-transparent text-sm text-text-body placeholder:text-text-muted border border-border rounded-md px-3 py-2 outline-none focus:border-cyan-500"
              onClick={(e) => e.stopPropagation()}
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-transparent text-sm text-text-body placeholder:text-text-muted border border-border rounded-md px-3 py-2 outline-none focus:border-cyan-500"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving} disabled={!url.trim()}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <a
              href={block.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-2 break-words"
              onClick={(e) => e.stopPropagation()}
            >
              {block.sourceTitle || block.sourceUrl}
            </a>
          </div>
        )}
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
        title="Delete Link"
        message="Are you sure you want to delete this link?"
      />
    </div>
  );
};
