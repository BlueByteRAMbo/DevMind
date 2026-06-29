// ============================================================
// DevMind — SearchPage Component
// Full-text search across all blocks in all topics.
// ============================================================

import React, { useState, useCallback } from "react";
import type { Block } from "../types";
import { db } from "../lib/db";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { useAppStore } from "../store/appStore";
import { Spinner } from "../components/ui/Spinner";

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Block[]>([]);
  const [searching, setSearching] = useState(false);
  const setSelectedTopicId = useAppStore((s) => s.setSelectedTopicId);
  const setMobileTab = useAppStore((s) => s.setMobileTab);

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      if (!q.trim()) {
        setResults([]);
        return;
      }

      setSearching(true);
      try {
        const lower = q.toLowerCase();
        const allBlocks = await db.blocks.toArray();
        const matched = allBlocks.filter(
          (block) =>
            block.content?.toLowerCase().includes(lower) ||
            block.sourceTitle?.toLowerCase().includes(lower) ||
            block.sourceUrl?.toLowerCase().includes(lower) ||
            block.ocrText?.toLowerCase().includes(lower) ||
            block.tags?.some((t) => t.toLowerCase().includes(lower))
        );
        setResults(matched);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  const handleResultClick = (block: Block) => {
    setSelectedTopicId(block.topicId);
    setMobileTab("topics");
  };

  function highlightText(text: string, query: string): React.ReactNode {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-accent-purple/30 text-text-primary rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-bg-base">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <h1 className="text-text-primary text-lg font-semibold mb-3">Search</h1>
        <Input
          id="search-input"
          placeholder="Search across all your blocks..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
          leftIcon={
            searching ? (
              <Spinner size="sm" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )
          }
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {!query ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-muted text-sm">
            Start typing to search your knowledge...
          </div>
        ) : results.length === 0 && !searching ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-muted text-sm">
            No results found for "{query}"
          </div>
        ) : (
          results.map((block) => (
            <button
              key={block.id}
              onClick={() => handleResultClick(block)}
              className="w-full text-left bg-bg-card border border-border rounded-xl px-4 py-3 hover:border-border-strong hover:bg-bg-hover transition-colors duration-150"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge type={block.type} />
                {block.sourceTitle && (
                  <span className="text-xs text-text-muted truncate">{block.sourceTitle}</span>
                )}
              </div>
              <p className="text-sm text-text-body line-clamp-3 leading-relaxed">
                {highlightText(
                  block.ocrText || block.content || block.sourceUrl || "",
                  query
                )}
              </p>
              <p className="text-[11px] text-text-muted mt-1.5">
                {new Date(block.updatedAt).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
