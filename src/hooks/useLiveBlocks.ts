// ============================================================
// DevMind — useLiveBlocks Hook
// Provides a reactive liveQuery subscription to Dexie blocks for the current topic.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "../lib/db";
import type { Block } from "../types";
import { useAppStore } from "../store/appStore";

export function useLiveBlocks() {
  const selectedTopicId = useAppStore((s) => s.selectedTopicId);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Fetch blocks for the current topic using Dexie's liveQuery for reactivity.
  const subscribe = useCallback(() => {
    if (!selectedTopicId) {
      setBlocks([]);
      return;
    }
    const query = liveQuery(async () => {
      const all = await db.blocks
        .where("topicId")
        .equals(selectedTopicId)
        .toArray();
      // Filter out soft-deleted blocks
      const active = all.filter((b) => b.syncStatus !== "deleted");

      // sort by pinned then order, same as useBlocks
      return active.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.order - b.order;
      });
    });

    const subscription = query.subscribe({
      next: (result) => setBlocks(result),
      error: (err) => console.error("[useLiveBlocks] liveQuery error:", err),
    });
    return () => subscription.unsubscribe();
  }, [selectedTopicId]);

  useEffect(() => {
    const cleanup = subscribe();
    return cleanup;
  }, [subscribe]);

  return blocks;
}
