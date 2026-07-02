// ============================================================
// DevMind — useTopics Hook
// All reads hit Dexie first (instant). Writes go to Dexie then
// sync to Supabase in the background (handled by useSync).
// ============================================================

import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { db } from "../lib/db";
import type { Topic } from "../types";
import { useAppStore } from "../store/appStore";

export function useTopics() {
  const user = useAppStore((s) => s.user);
  const setSelectedTopicId = useAppStore((s) => s.setSelectedTopicId);

  const getAll = useCallback(async (): Promise<Topic[]> => {
    const all = await db.topics.toArray();
    return all
      .filter((t) => t.syncStatus !== "deleted")
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, []);

  /** Create a new topic in Dexie. Caller is responsible for syncing. */
  const create = useCallback(
    async (name: string, colour = "#7C6AF7"): Promise<Topic> => {
      const now = new Date();
      const topic: Topic = {
        id: uuid(),
        name,
        colour,
        createdAt: now,
        updatedAt: now,
        masteryPercent: 0,
        syncStatus: "pending",
      };
      await db.topics.put(topic);
      setSelectedTopicId(topic.id);
      return topic;
    },
    [setSelectedTopicId]
  );

  /** Update a topic in Dexie. */
  const update = useCallback(
    async (id: string, patch: Partial<Omit<Topic, "id" | "createdAt">>): Promise<void> => {
      await db.topics.update(id, { ...patch, updatedAt: new Date(), syncStatus: "pending" });
    },
    []
  );

  /** Delete a topic and all its blocks from Dexie. */
  const remove = useCallback(async (id: string): Promise<void> => {
    await db.transaction("rw", db.topics, db.blocks, async () => {
      const blocks = await db.blocks.where("topicId").equals(id).toArray();
      for (const b of blocks) {
        await db.blocks.update(b.id!, { syncStatus: "deleted", updatedAt: new Date() });
      }
      await db.topics.update(id, { syncStatus: "deleted", updatedAt: new Date() });
    });
  }, []);

  /**
   * Recalculate mastery % for a topic based on block count.
   * Formula: logarithmic curve — 10 blocks ≈ 50%, 30 blocks ≈ 90%, 50+ blocks ≈ 100%.
   * Call this after any block create or delete for the topic.
   */
  const recalculateMastery = useCallback(
    async (topicId: string): Promise<void> => {
      const blockCount = await db.blocks.where("topicId").equals(topicId).count();
      // log scale: mastery = min(100, round(log(blockCount+1) / log(51) * 100))
      const mastery = Math.min(
        100,
        Math.round((Math.log(blockCount + 1) / Math.log(51)) * 100)
      );
      await db.topics.update(topicId, {
        masteryPercent: mastery,
        updatedAt: new Date(),
      });
    },
    []
  );

  return { getAll, create, update, remove, recalculateMastery, user };
}
