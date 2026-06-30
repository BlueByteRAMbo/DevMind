// ============================================================
// DevMind — TopicPage Component
// Canvas + SourcePanel for the selected topic.
// ============================================================

import React from "react";
import { Canvas } from "../components/canvas/Canvas";
import { SourcePanel } from "../components/panels/SourcePanel";
import { exportTopicToPDF } from "../lib/pdf";
import { db } from "../lib/db";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import type { Topic } from "../types";

export const TopicPage: React.FC = () => {
  const selectedTopicId = useAppStore((s) => s.selectedTopicId);
  const setSelectedTopicId = useAppStore((s) => s.setSelectedTopicId);
  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
    if (selectedTopicId) {
      db.topics.get(selectedTopicId).then((t) => setTopic(t ?? null));
    } else {
      setTopic(null);
    }
  }, [selectedTopicId]);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Canvas — grows to fill available space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topic header */}
        {topic && (
  <div className="px-4 md:px-6 py-3.5 border-b border-border flex items-center gap-2.5 flex-shrink-0">
    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: topic.colour }} />
    <h1 className="text-text-primary font-semibold text-base truncate">{topic.name}</h1>
    {/* Close button */}
    <button
      onClick={() => setSelectedTopicId(null)}
      className="ml-auto p-1.5 rounded-md text-text-muted hover:text-text-body hover:bg-bg-hover transition-colors"
      aria-label="Close topic"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    {/* Export PDF button */}
    <button
      onClick={() => selectedTopicId && exportTopicToPDF(selectedTopicId)}
      className="ml-2 p-1.5 rounded-md text-text-muted hover:text-text-body hover:bg-bg-hover transition-colors"
      aria-label="Export topic to PDF"
    >
      <svg className="w-4 h-4 icon-glow text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h16v16H4z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12h8M8 16h8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  </div>
)}
        <Canvas />
      </div>

      {/* Source panel — hidden on mobile */}
      <div className="hidden md:flex w-64 lg:w-72 flex-col border-l border-border">
        <SourcePanel />
      </div>
    </div>
  );
};
