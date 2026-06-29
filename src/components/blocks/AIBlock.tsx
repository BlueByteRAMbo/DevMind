// ============================================================
// DevMind — AIBlock Component
// Stores AI-generated responses. 4px left border: accent-purple.
// Has a "Regenerate" button to re-query the AI.
// ============================================================

import React, { useState, useCallback } from "react";
import type { Block } from "../../types";
import { useBlocks } from "../../hooks/useBlocks";
import { useAI } from "../../hooks/useAI";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useAppStore } from "../../store/appStore";

interface AIBlockProps {
  block: Block;
  onDeleted?: () => void;
}

export const AIBlock: React.FC<AIBlockProps> = ({ block, onDeleted }) => {
  const [content, setContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(!block.content);
  const [prompt, setPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(!block.content);
  const { update, remove, togglePin } = useBlocks();
  const { ask, loading } = useAI();
  const setSelectedBlockId = useAppStore((s) => s.setSelectedBlockId);

  const handleAsk = useCallback(async () => {
    if (!prompt.trim()) return;
    const text = await ask(prompt);
    if (text) {
      setContent(text);
      await update(block.id!, { content: text, sourceTitle: prompt });
      setShowPrompt(false);
    }
  }, [prompt, ask, update, block.id]);

  const handleRegenerate = useCallback(async () => {
    const promptText = block.sourceTitle || prompt;
    if (!promptText) { setShowPrompt(true); return; }
    const text = await ask(promptText);
    if (text) {
      setContent(text);
      await update(block.id!, { content: text });
    }
  }, [block.sourceTitle, prompt, ask, update, block.id]);

  const handleDelete = useCallback(async () => {
    await remove(block.id!);
    onDeleted?.();
  }, [block.id, remove, onDeleted]);

  return (
    <div
      className="animate-block-in group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border-strong transition-colors duration-150 border-l-4 border-l-accent-purple"
      onClick={() => setSelectedBlockId(block.id ?? null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-accent-purple/5">
        <div className="flex items-center gap-2">
          <Badge type="ai_response" />
          {block.sourceTitle && (
            <span className="text-xs text-text-muted truncate max-w-[180px]">
              "{block.sourceTitle}"
            </span>
          )}
          {block.isPinned && (
            <span className="text-[10px] text-accent-amber">📌</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRegenerate(); }} isLoading={loading}>
            Regenerate
          </Button>
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
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Prompt input (shown when empty or re-prompting) */}
      {showPrompt && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2">
            <input
              id={`ai-block-prompt-${block.id}`}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask AI anything... (Enter to send)"
              autoFocus
              className="flex-1 bg-transparent text-sm text-text-body placeholder:text-text-muted border-none outline-none"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAsk}
              isLoading={loading}
              disabled={!prompt.trim()}
            >
              Ask
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3 min-h-[60px]">
        {loading ? (
          <div className="flex items-center gap-2 text-text-muted text-sm animate-glow-pulse">
            <Spinner size="sm" />
            <span>Thinking...</span>
          </div>
        ) : content ? (
          <div className="space-y-1">
            <p className="text-sm text-text-body leading-relaxed whitespace-pre-wrap font-mono">
              {content}
            </p>
            {!showPrompt && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowPrompt(true); }}
                className="text-[11px] text-accent-purple hover:text-accent-purple2 mt-1 transition-colors"
              >
                + Ask a follow-up
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-muted italic">Enter a prompt above to get an AI response.</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 text-[11px] text-text-muted border-t border-border">
        {new Date(block.updatedAt).toLocaleString()}
        {block.syncStatus === "pending" && (
          <span className="ml-2 text-accent-amber">● pending sync</span>
        )}
      </div>
    </div>
  );
};
