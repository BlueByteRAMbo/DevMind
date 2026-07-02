// ============================================================
// DevMind — useCollections Hook
// CRUD for collections in Dexie (local-first).
// Sync to Supabase handled by useSync.
// ============================================================

import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { db } from "../lib/db";
import type { Collection } from "../types";

export function useCollections() {
  const getAll = useCallback(async (): Promise<Collection[]> => {
    const all = await db.collections.toArray();
    return all
      .filter((c) => c.syncStatus !== "deleted")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  const create = useCallback(async (name: string): Promise<Collection> => {
    const col: Collection = {
      id: uuid(),
      name,
      topicIds: [],
      createdAt: new Date(),
      syncStatus: "pending",
    };
    await db.collections.put(col);
    return col;
  }, []);

  const rename = useCallback(async (id: string, name: string): Promise<void> => {
    await db.collections.update(id, { name, syncStatus: "pending" });
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await db.collections.update(id, { syncStatus: "deleted" });
    // Remove this collection from any topics that referenced it
    const topics = await db.topics.toArray();
    for (const t of topics) {
      if (t.collectionId === id) {
        await db.topics.update(t.id, { collectionId: undefined, updatedAt: new Date(), syncStatus: "pending" });
      }
    }
  }, []);

  /** Add or remove a topic from a collection. */
  const toggleTopic = useCallback(async (collectionId: string, topicId: string): Promise<void> => {
    const col = await db.collections.get(collectionId);
    if (!col) return;
    const has = col.topicIds.includes(topicId);
    const next = has ? col.topicIds.filter((id) => id !== topicId) : [...col.topicIds, topicId];
    await db.collections.update(collectionId, { topicIds: next });
    // Also stamp collectionId on the topic itself
    await db.topics.update(topicId, {
      collectionId: has ? undefined : collectionId,
      updatedAt: new Date(),
    });
  }, []);

  return { getAll, create, rename, remove, toggleTopic };
}
