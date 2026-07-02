// ============================================================
// DevMind — SynthesisBlock Component
// Personal understanding after reviewing all sources.
// 4px left border: accent-teal. Subtle teal tint on background.
// ============================================================

import React, { useState, useCallback } from "react";
import type { Block } from "../../types";
import { useBlocks } from "../../hooks/useBlocks";
import { useAI } from "../../hooks/useAI";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { useAppStore } from "../../store/appStore";
import { db } from "../../lib/db";

interface SynthesisBlockProps {
  block: Block;
  onDeleted?: () => void;
}

export const SynthesisBlock: React.FC<SynthesisBlockProps> = ({
  block,
  onDeleted,
}) => {
  const [content, setContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(!block.content);
  const [drafting, setDrafting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { update, remove, togglePin } = useBlocks();
  const { synthesize } = useAI();
  const setSelectedBlockId = useAppStore((s) => s.setSelectedBlockId);

  const handleDraftWithAI = useCallback(async () => {
    setDrafting(true);
    try {
      // Gather all other blocks in this topic
      const allBlocks = await db.blocks
        .where("topicId")
        .equals(block.topicId)
        .toArray();

      const topic = await db.topics.get(block.topicId);
      const topicName = topic?.name ?? "Unknown Topic";

      const blockContent = allBlocks
        .filter((b) => b.id !== block.id && b.content)
        .map((b) => `[${b.type}]\n${b.ocrText || b.content}`)
        .join("\n\n---\n\n");

      if (!blockContent.trim()) {
        alert("Add some blocks with content before drafting a synthesis.");
        return;
      }

      const draft = await synthesize(blockContent, topicName);
      if (draft) {
        setContent(draft);
        await update(block.id!, { content: draft });
        setIsEditing(false);
      }
    } finally {
      setDrafting(false);
    }
  }, [block.id, block.topicId, synthesize, update]);

  const handleSave = useCallback(async () => {
    await update(block.id!, { content });
    setIsEditing(false);
  }, [block.id, content, update]);

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
      className="animate-block-in group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border-strong transition-colors duration-150 border-l-4 border-l-accent-teal"
      style={{ background: "linear-gradient(135deg, rgba(62,207,173,0.04) 0%, transparent 60%)" }}
      onClick={() => setSelectedBlockId(block.id ?? null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-accent-teal/5">
        <div className="flex items-center gap-2">
          <Badge type="synthesis" />
          <span className="text-xs text-text-muted">Your understanding</span>
          {block.isPinned && <span className="text-[10px] text-accent-amber">📌</span>}
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="teal"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleDraftWithAI(); }}
            isLoading={drafting}
          >
            ✦ Draft with AI
          </Button>
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

      {/* Content */}
      <div className="px-4 py-3 min-h-[80px]">
        {drafting ? (
          <div className="flex items-center gap-2 text-text-muted text-sm animate-glow-pulse">
            <Spinner size="sm" />
            <span className="text-accent-teal">Synthesising your notes...</span>
          </div>
        ) : isEditing ? (
          <div className="space-y-2">
            <textarea
              id={`synthesis-block-${block.id}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSave();
              }}
              placeholder="Write your personal synthesis here — the key insight you took away from all sources..."
              rows={5}
              autoFocus
              className="w-full bg-transparent text-sm text-text-body placeholder:text-text-muted border-none outline-none resize-none leading-relaxed"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="teal" size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : content ? (
          <p
            className="text-sm text-text-body leading-relaxed whitespace-pre-wrap cursor-text"
            onClick={() => setIsEditing(true)}
          >
            {content}
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
            <p className="text-sm text-text-muted">
              Write your personal synthesis, or let AI draft one from your blocks.
            </p>
            <div className="flex gap-2">
              <Button variant="teal" size="sm" onClick={(e) => { e.stopPropagation(); handleDraftWithAI(); }}>
                ✦ Draft with AI
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                Write manually
              </Button>
            </div>
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
        title="Delete Synthesis"
        message="Are you sure you want to delete this synthesis block?"
      />
    </div>
  );
};
