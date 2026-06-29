// ============================================================
// DevMind — useBlocks Hook
// Optimistic: writes to Dexie instantly, sync happens after.
// ============================================================

import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { db } from "../lib/db";
import type { Block, BlockType } from "../types";
import { useAppStore } from "../store/appStore";

export function useBlocks() {
  const selectedTopicId = useAppStore((s) => s.selectedTopicId);

  /** Fetch all blocks for the current topic, ordered by isPinned then order. */
  const getAll = useCallback(
    async (topicId?: string): Promise<Block[]> => {
      const tid = topicId ?? selectedTopicId;
      if (!tid) return [];
      const blocks = await db.blocks.where("topicId").equals(tid).toArray();
      return blocks.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.order - b.order;
      });
    },
    [selectedTopicId]
  );

  /** Get a single block by its UUID. */
  const getById = useCallback(async (id: string): Promise<Block | undefined> => {
    return db.blocks.get(id);
  }, []);

  /**
   * Create a new block (optimistic).
   * Provide all fields except id, createdAt, updatedAt, syncStatus.
   */
  const create = useCallback(
    async (
      partial: Omit<Block, "id" | "createdAt" | "updatedAt" | "syncStatus">
    ): Promise<Block> => {
      const now = new Date();
      const block: Block = {
        ...partial,
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        syncStatus: "pending",
      };
      await db.blocks.put(block);
      return block;
    },
    []
  );

  /** Update a block (optimistic). */
  const update = useCallback(
    async (id: string, patch: Partial<Omit<Block, "id" | "createdAt">>): Promise<void> => {
      await db.blocks.update(id, {
        ...patch,
        updatedAt: new Date(),
        syncStatus: "pending",
      });
    },
    []
  );

  /** Delete a block (optimistic) and recalculate topic mastery. */
  const remove = useCallback(async (id: string): Promise<void> => {
    const block = await db.blocks.get(id);
    await db.blocks.delete(id);
    // Recalculate mastery now that block count has changed
    if (block?.topicId) {
      const blockCount = await db.blocks.where("topicId").equals(block.topicId).count();
      const mastery = Math.min(100, Math.round((Math.log(blockCount + 1) / Math.log(51)) * 100));
      await db.topics.update(block.topicId, { masteryPercent: mastery, updatedAt: new Date() });
    }
  }, []);

  /** Reorder blocks by dragging — updates the `order` field of all affected blocks. */
  const reorder = useCallback(
    async (topicId: string, orderedIds: string[]): Promise<void> => {
      await db.transaction("rw", db.blocks, async () => {
        for (let i = 0; i < orderedIds.length; i++) {
          await db.blocks.update(orderedIds[i], {
            order: i,
            updatedAt: new Date(),
            syncStatus: "pending",
          });
        }
      });
    },
    []
  );

  /** Toggle the pinned state of a block. */
  const togglePin = useCallback(async (id: string): Promise<void> => {
    const block = await db.blocks.get(id);
    if (!block) return;
    await db.blocks.update(id, {
      isPinned: !block.isPinned,
      updatedAt: new Date(),
      syncStatus: "pending",
    });
  }, []);

  return { getAll, getById, create, update, remove, reorder, togglePin };
}
