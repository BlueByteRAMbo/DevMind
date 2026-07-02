// ============================================================
// DevMind — AddBlockRow Component
// Horizontal scrollable row of block type buttons below the canvas.
// ============================================================

import React from "react";
import type { BlockType } from "../../types";
import { useBlocks } from "../../hooks/useBlocks";
import { useTopics } from "../../hooks/useTopics";
import { useAppStore } from "../../store/appStore";
import { db } from "../../lib/db";

interface BlockTypeOption {
  type: BlockType;
  label: string;
  icon: string;
  color: string;
}

const BLOCK_TYPES: BlockTypeOption[] = [
  { type: "own_note",         label: "Note",        icon: "📝", color: "text-text-body" },
  { type: "ai_response",      label: "AI Response", icon: "✦",  color: "text-accent-purple" },
  { type: "url_clip",         label: "URL Clip",    icon: "🔗", color: "text-blue-400" },
  { type: "youtube_note",     label: "YouTube",     icon: "▶",  color: "text-red-400" },
  { type: "handwritten_scan", label: "Handwritten", icon: "✍",  color: "text-accent-amber" },
  { type: "synthesis",        label: "Synthesis",   icon: "◈",  color: "text-accent-teal" },
  { type: "link",             label: "Link",        icon: "🔗", color: "text-cyan-400" },
];

interface AddBlockRowProps {
  onBlockAdded?: () => void;
}

export const AddBlockRow: React.FC<AddBlockRowProps> = ({ onBlockAdded }) => {
  const selectedTopicId = useAppStore((s) => s.selectedTopicId);
  const { create } = useBlocks();
  const { recalculateMastery } = useTopics();

  const handleAdd = async (type: BlockType) => {
    if (!selectedTopicId) return;

    const blockCount = await db.blocks.where("topicId").equals(selectedTopicId).count();

    await create({
      topicId: selectedTopicId,
      type,
      content: "",
      order: blockCount,
      isPinned: false,
      tags: [],
    });

    // Update mastery % based on new block count
    await recalculateMastery(selectedTopicId);

    onBlockAdded?.();
  };


  return (
    <div className="border-t border-border bg-bg-surface/80 backdrop-blur-sm">
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
        <span className="text-xs text-text-muted mr-1 flex-shrink-0">Add block:</span>
        {BLOCK_TYPES.map((opt) => (
          <button
            key={opt.type}
            id={`add-block-${opt.type}`}
            onClick={() => handleAdd(opt.type)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-bg-card hover:bg-bg-hover hover:border-border-strong transition-all duration-150 flex-shrink-0 group"
          >
            <span className={`text-sm ${opt.color} group-hover:scale-110 transition-transform`}>
              {opt.icon}
            </span>
            <span className="text-xs text-text-subtle group-hover:text-text-body transition-colors whitespace-nowrap">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
