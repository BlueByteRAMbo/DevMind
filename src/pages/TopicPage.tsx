// ============================================================
// DevMind — TopicPage Component
// Canvas + SourcePanel for the selected topic.
// ============================================================

import React from "react";
import { Canvas } from "../components/canvas/Canvas";
import { SourcePanel } from "../components/panels/SourcePanel";
import { useAppStore } from "../store/appStore";
import { db } from "../lib/db";
import { useEffect, useState } from "react";
import type { Topic } from "../types";

export const TopicPage: React.FC = () => {
  const selectedTopicId = useAppStore((s) => s.selectedTopicId);
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
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: topic.colour }}
            />
            <h1 className="text-text-primary font-semibold text-base truncate">
              {topic.name}
            </h1>
            {topic.masteryPercent > 0 && (
              <span className="text-xs text-text-muted ml-auto font-mono">
                {topic.masteryPercent}% mastery
              </span>
            )}
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
