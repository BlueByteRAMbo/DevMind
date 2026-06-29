// ============================================================
// DevMind — SourcePanel Component
// Right-side panel showing metadata for the selected block.
// ============================================================

import React, { useEffect, useState } from "react";
import type { Block } from "../../types";
import { useAppStore } from "../../store/appStore";
import { useBlocks } from "../../hooks/useBlocks";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/Skeleton";

export const SourcePanel: React.FC = () => {
  const selectedBlockId = useAppStore((s) => s.selectedBlockId);
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(false);
  const { getById } = useBlocks();

  useEffect(() => {
    if (!selectedBlockId) {
      setBlock(null);
      return;
    }
    setLoading(true);
    getById(selectedBlockId).then((b) => {
      setBlock(b ?? null);
      setLoading(false);
    });
  }, [selectedBlockId, getById]);

  if (!selectedBlockId) {
    return (
      <aside className="flex flex-col bg-bg-surface border-l border-border">
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="space-y-2">
            <p className="text-text-muted text-sm">Click a block to see its metadata here.</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col bg-bg-surface border-l border-border overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
          Block Details
        </h3>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">
          <Skeleton height="h-5" width="w-24" rounded="full" />
          <Skeleton lines={4} />
        </div>
      ) : block ? (
        <div className="p-4 space-y-4">
          {/* Type badge */}
          <div className="space-y-1">
            <label className="text-[11px] text-text-muted uppercase tracking-wider">Type</label>
            <Badge type={block.type} />
          </div>

          {/* Source URL */}
          {block.sourceUrl && (
            <div className="space-y-1">
              <label className="text-[11px] text-text-muted uppercase tracking-wider">Source</label>
              <a
                href={block.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-accent-purple hover:text-accent-purple2 break-all transition-colors"
              >
                {block.sourceUrl}
              </a>
            </div>
          )}

          {/* Title */}
          {block.sourceTitle && (
            <div className="space-y-1">
              <label className="text-[11px] text-text-muted uppercase tracking-wider">Title</label>
              <p className="text-xs text-text-body">{block.sourceTitle}</p>
            </div>
          )}

          {/* Tags */}
          {block.tags?.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] text-text-muted uppercase tracking-wider">Tags</label>
              <div className="flex flex-wrap gap-1">
                {block.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] bg-bg-hover border border-border rounded-full px-2 py-0.5 text-text-subtle"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-2 pt-1 border-t border-border">
            <div className="space-y-0.5">
              <label className="text-[11px] text-text-muted uppercase tracking-wider">Created</label>
              <p className="text-xs text-text-subtle">
                {new Date(block.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-0.5">
              <label className="text-[11px] text-text-muted uppercase tracking-wider">Updated</label>
              <p className="text-xs text-text-subtle">
                {new Date(block.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Sync status */}
          <div className="space-y-1">
            <label className="text-[11px] text-text-muted uppercase tracking-wider">Sync</label>
            <p
              className={[
                "text-xs font-medium",
                block.syncStatus === "synced"  ? "text-accent-green" :
                block.syncStatus === "pending" ? "text-accent-amber" :
                "text-accent-red",
              ].join(" ")}
            >
              {block.syncStatus === "synced"   ? "✓ Synced" :
               block.syncStatus === "pending"  ? "⏳ Pending" :
               "⚠ Conflict"}
            </p>
          </div>

          {/* OCR text (handwritten scan) */}
          {block.ocrText && (
            <div className="space-y-1 pt-1 border-t border-border">
              <label className="text-[11px] text-text-muted uppercase tracking-wider">OCR Text</label>
              <p className="text-xs text-text-body leading-relaxed whitespace-pre-wrap font-mono">
                {block.ocrText}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-sm text-text-muted">Block not found.</div>
      )}
    </aside>
  );
};
