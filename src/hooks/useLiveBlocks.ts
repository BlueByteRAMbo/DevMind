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
      // sort by pinned then order, same as useBlocks
      return all.sort((a, b) => {
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

  // Re‑export CRUD helpers same as useBlocks for convenience
  const create = async (partial: Omit<Block, "id" | "createdAt" | "updatedAt" | "syncStatus">) => {
    const now = new Date();
    const { v4: uuid } = await import("uuid");
    const block: Block = {
      ...partial,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      syncStatus: "pending",
    };
    await db.blocks.put(block);
    return block;
  };

  const update = async (id: string, patch: Partial<Omit<Block, "id" | "createdAt">>) => {
    await db.blocks.update(id, { ...patch, updatedAt: new Date(), syncStatus: "pending" });
  };

  const remove = async (id: string) => {
    const block = await db.blocks.get(id);
    await db.blocks.delete(id);
    if (block?.topicId) {
      const count = await db.blocks.where("topicId").equals(block.topicId).count();
      const mastery = Math.min(100, Math.round((Math.log(count + 1) / Math.log(51)) * 100));
      await db.topics.update(block.topicId, { masteryPercent: mastery, updatedAt: new Date() });
    }
  };

  const reorder = async (_topicId: string, orderedIds: string[]) => {
    await db.transaction("rw", db.blocks, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.blocks.update(orderedIds[i], { order: i, updatedAt: new Date(), syncStatus: "pending" });
      }
    });
  };

  const togglePin = async (id: string) => {
    const block = await db.blocks.get(id);
    if (!block) return;
    await db.blocks.update(id, { isPinned: !block.isPinned, updatedAt: new Date(), syncStatus: "pending" });
  };

  return { blocks, create, update, remove, reorder, togglePin };
}
