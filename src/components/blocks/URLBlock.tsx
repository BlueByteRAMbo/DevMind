// ============================================================
// DevMind — URLBlock Component
// Paste a URL → extracts readable content via AI proxy.
// 4px left border: blue-500.
// ============================================================

import React, { useState, useCallback } from "react";
import type { Block } from "../../types";
import { useBlocks } from "../../hooks/useBlocks";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useAppStore } from "../../store/appStore";
import { callAIProxy } from "../../lib/gemini";

interface URLBlockProps {
  block: Block;
  onDeleted?: () => void;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export const URLBlock: React.FC<URLBlockProps> = ({ block, onDeleted }) => {
  const [url, setUrl] = useState(block.sourceUrl || "");
  const [content, setContent] = useState(block.content);
  const [title, setTitle] = useState(block.sourceTitle || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const { update, remove, togglePin } = useBlocks();
  const setSelectedBlockId = useAppStore((s) => s.setSelectedBlockId);

  const handleSaveEdit = async () => {
    await update(block.id!, { content: draftContent });
    setContent(draftContent);
    setEditing(false);
  };

  const handleFetch = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Use the AI proxy to fetch and summarise the page content
      const result = await callAIProxy({
        provider: "gemini",
        messages: [
          {
            role: "user",
            content: `Please fetch and extract the main readable content from this URL: ${url}

Extract the article title, and the full body text, removing navigation, ads, and footers. Format as:
TITLE: [title]
---
[body content]`,
          },
        ],
        systemPrompt:
          "You are a web content extractor. Extract clean, readable text from web pages.",
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      const lines = result.text.split("\n");
      const titleLine = lines.find((l) => l.startsWith("TITLE:"));
      const extractedTitle = titleLine
        ? titleLine.replace("TITLE:", "").trim()
        : extractDomain(url);
      const bodyStart = lines.findIndex((l) => l.trim() === "---") + 1;
      const body =
        bodyStart > 0
          ? lines.slice(bodyStart).join("\n").trim()
          : result.text;

      setTitle(extractedTitle);
      setContent(body);
      await update(block.id!, {
        sourceUrl: url,
        sourceTitle: extractedTitle,
        content: body,
      });
    } catch (err) {
      setError("Failed to fetch URL content.");
    } finally {
      setLoading(false);
    }
  }, [url, update, block.id]);

  const handleDelete = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete this block?")) {
      await remove(block.id!);
      onDeleted?.();
    }
  }, [block.id, remove, onDeleted]);

  return (
    <div
      className="animate-block-in group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border-strong transition-colors duration-150 border-l-4 border-l-blue-500"
      onClick={() => setSelectedBlockId(block.id ?? null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge type="url_clip" />
          {title && (
            <span className="text-xs text-text-subtle truncate max-w-[200px]">{title}</span>
          )}
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

      {/* URL input */}
      {!content && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2">
            <input
              id={`url-block-input-${block.id}`}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              onPaste={(e) => {
                // Auto-fetch when a URL is pasted
                const pasted = e.clipboardData.getData("text");
                if (pasted.startsWith("http")) {
                  setUrl(pasted);
                  // Small delay so state updates before fetch fires
                  setTimeout(() => handleFetch(), 100);
                }
              }}
              placeholder="Paste a URL to clip it automatically…"
              autoFocus
              className="flex-1 bg-transparent text-sm text-text-body placeholder:text-text-muted border-none outline-none"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleFetch}
              isLoading={loading}
              disabled={!url.trim()}
            >
              Clip
            </Button>
          </div>
        </div>
      )}


      {/* Content */}
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <Spinner size="sm" />
            <span>Extracting content...</span>
          </div>
        ) : error && !editing ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-accent-red">{error}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setDraftContent(content); setEditing(true); }}
              className="text-[11px] text-blue-400 hover:text-blue-300 self-start transition-colors"
            >
              Add Text Manually
            </button>
          </div>
        ) : editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={6}
              className="w-full bg-bg-hover border border-border rounded-md text-sm text-text-body p-2 outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-1.5 justify-end mt-1">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : content ? (
          <div className="space-y-2 relative group/content">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate pr-10"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {extractDomain(url)}
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setDraftContent(content); setEditing(true); }}
              className="absolute top-0 right-0 opacity-0 group-hover/content:opacity-100 text-[11px] text-blue-400 hover:text-blue-300 transition-opacity bg-bg-card pl-2"
            >
              Edit
            </button>
            <p className="text-sm text-text-body leading-relaxed line-clamp-6 whitespace-pre-wrap">
              {content}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-text-muted italic">Paste a URL above to clip the content.</p>
            <button
              onClick={(e) => { e.stopPropagation(); setDraftContent(""); setEditing(true); }}
              className="text-[11px] text-blue-400 hover:text-blue-300 self-start transition-colors"
            >
              Add Text Manually
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-[11px] text-text-muted border-t border-border">
        {new Date(block.updatedAt).toLocaleString()}
        {block.syncStatus === "pending" && (
          <span className="ml-2 text-accent-amber">● pending sync</span>
        )}
      </div>
    </div>
  );
};
