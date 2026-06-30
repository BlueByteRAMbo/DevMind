// ============================================================
// DevMind — TopicItem Component
// Single topic entry in the sidebar with colour dot and mastery bar.
// Double-click the name (or click ✎) to rename inline.
// ============================================================

import React, { useState, useRef, useEffect } from "react";
import type { Topic } from "../../types";
import { useAppStore } from "../../store/appStore";

interface TopicItemProps {
  topic: Topic;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onDeletePending?: (id: string) => void;
}

export const TopicItem: React.FC<TopicItemProps> = ({ topic, onDelete, onRename, onDeletePending }) => {
  const selectedTopicId = useAppStore((s) => s.selectedTopicId);
  const setSelectedTopicId = useAppStore((s) => s.setSelectedTopicId);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(topic.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedTopicId === topic.id;

  // Focus input when rename mode activates
  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming]);

  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftName(topic.name);
    setRenaming(true);
  };

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== topic.name) {
      onRename?.(topic.id, trimmed);
    }
    setRenaming(false);
  };

  const cancelRename = () => {
    setDraftName(topic.name);
    setRenaming(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      id={`topic-item-${topic.id}`}
      onClick={() => !renaming && setSelectedTopicId(topic.id)}
      onKeyDown={(e) => !renaming && e.key === "Enter" && setSelectedTopicId(topic.id)}
      onDoubleClick={startRename}
      className={[
        "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer",
        "transition-all duration-150 select-none",
        isSelected
          ? "bg-accent-purple/10 border border-accent-purple/20"
          : "hover:bg-bg-hover border border-transparent",
      ].join(" ")}
    >
      {/* Colour dot */}
      <span
        className="flex-shrink-0 w-2 h-2 rounded-full"
        style={{ backgroundColor: topic.colour }}
      />

      {/* Topic name — inline rename input or plain text */}
      {renaming ? (
        <input
          ref={inputRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") cancelRename();
            e.stopPropagation();
          }}
          onBlur={commitRename}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-bg-hover border border-accent-purple/40 rounded px-1.5 py-0.5 text-sm text-text-primary outline-none min-w-0"
          maxLength={60}
        />
      ) : (
        <span
          className={[
            "flex-1 text-sm truncate transition-colors duration-150",
            isSelected ? "text-text-primary font-medium" : "text-text-body",
          ].join(" ")}
        >
          {topic.name}
        </span>
      )}

      {/* Mastery % */}
      {!renaming && topic.masteryPercent > 0 && (
        <span className="text-[10px] text-text-muted font-mono">
          {topic.masteryPercent}%
        </span>
      )}

      {/* Action buttons (visible on hover) */}
      {!renaming && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
          {/* Rename */}
          {onRename && (
            <button
              onClick={startRename}
              className="p-2 rounded text-text-muted hover:text-text-body"
              aria-label={`Rename topic ${topic.name}`}
              title="Rename"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {/* Delete */}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeletePending?.(topic.id); }}
              className="p-2 rounded text-text-muted hover:text-accent-red"
              aria-label={`Delete topic ${topic.name}`}
              title="Delete"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Selected indicator bar */}
      {isSelected && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-accent-purple" />
      )}
    </div>
  );
};
