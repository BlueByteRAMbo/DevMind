// ============================================================
// DevMind — NoteBlock Component
// Plain own-note block with inline editable textarea.
// 4px left border: border-strong (neutral).
// ============================================================

import React, { useState, useCallback, useRef } from "react";
import type { Block } from "../../types";
import { useBlocks } from "../../hooks/useBlocks";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useAppStore } from "../../store/appStore";

interface NoteBlockProps {
  block: Block;
  onDeleted?: () => void;
}

export const NoteBlock: React.FC<NoteBlockProps> = ({ block, onDeleted }) => {
  const [content, setContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(!block.content);
  const [saving, setSaving] = useState(false);
  const { update, remove, togglePin } = useBlocks();
  const setSelectedBlockId = useAppStore((s) => s.setSelectedBlockId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await update(block.id!, { content });
    setSaving(false);
    setIsEditing(false);
  }, [block.id, content, update]);

  const handleDelete = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete this block?")) {
      await remove(block.id!);
      onDeleted?.();
    }
  }, [block.id, remove, onDeleted]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={[
        "animate-block-in group bg-bg-card border border-border rounded-xl overflow-hidden",
        "transition-colors duration-150 hover:border-border-strong",
        "border-l-4 border-l-border-strong",
      ].join(" ")}
      onClick={() => setSelectedBlockId(block.id ?? null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge type="own_note" />
          {block.isPinned && (
            <span className="text-[10px] text-accent-amber font-medium">📌 Pinned</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); togglePin(block.id!); }}
            className="p-1.5 rounded-md text-text-muted hover:text-accent-amber hover:bg-bg-hover transition-colors"
            title={block.isPinned ? "Unpin" : "Pin"}
          >
            <svg className="w-3.5 h-3.5" fill={block.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          {!isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
              className="p-1.5 rounded-md text-text-muted hover:text-text-body hover:bg-bg-hover transition-colors"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="p-1.5 rounded-md text-text-muted hover:text-accent-red hover:bg-bg-hover transition-colors"
            title="Delete"
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
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              id={`note-block-${block.id}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your note here... (Ctrl+Enter to save)"
              autoFocus
              rows={4}
              className="w-full bg-transparent text-sm text-text-body placeholder:text-text-muted border-none outline-none resize-none leading-relaxed font-sans"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p
            className="text-sm text-text-body leading-relaxed whitespace-pre-wrap cursor-text"
            onClick={() => setIsEditing(true)}
          >
            {content || <span className="text-text-muted italic">Click to add a note...</span>}
          </p>
        )}
      </div>

      {/* Footer: timestamp */}
      <div className="px-4 py-2 text-[11px] text-text-muted">
        {new Date(block.updatedAt).toLocaleString()}
        {block.syncStatus === "pending" && (
          <span className="ml-2 text-accent-amber">● pending sync</span>
        )}
      </div>
    </div>
  );
};
