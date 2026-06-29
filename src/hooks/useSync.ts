// ============================================================
// DevMind — useSync Hook
// Local-first sync pattern:
//   1. On mount: render from Dexie immediately (zero load time)
//   2. Background: pull Supabase records newer than local
//   3. On every write: push pending records to Supabase
// ============================================================

import { useEffect, useCallback } from "react";
import { db } from "../lib/db";
import { supabase } from "../lib/supabase";
import type { Topic, Block } from "../types";
import { useAppStore } from "../store/appStore";

export function useSync() {
  const user = useAppStore((s) => s.user);

  /**
   * Pull all user records from Supabase and hydrate Dexie.
   * Server wins on conflict (last-write wins by updated_at).
   */
  const pullFromServer = useCallback(async () => {
    if (!user) return;

    try {
      // Pull topics
      const { data: topics } = await supabase
        .from("topics")
        .select("*")
        .eq("user_id", user.id);

      if (topics) {
        for (const t of topics) {
          const local = await db.topics.get(t.id);
          const serverUpdated = new Date(t.updated_at).getTime();
          const localUpdated = local
            ? new Date(local.updatedAt).getTime()
            : 0;

          if (!local || serverUpdated > localUpdated) {
            const mapped: Topic = {
              id: t.id,
              name: t.name,
              colour: t.colour,
              collectionId: t.collection_id,
              createdAt: new Date(t.created_at),
              updatedAt: new Date(t.updated_at),
              masteryPercent: t.mastery_percent ?? 0,
            };
            await db.topics.put(mapped);
          }
        }
      }

      // Pull blocks
      const { data: blocks } = await supabase
        .from("blocks")
        .select("*")
        .eq("user_id", user.id);

      if (blocks) {
        for (const b of blocks) {
          const local = await db.blocks.get(b.id);
          const serverUpdated = new Date(b.updated_at).getTime();
          const localUpdated = local
            ? new Date(local.updatedAt).getTime()
            : 0;

          if (!local || serverUpdated > localUpdated) {
            const mapped: Block = {
              id: b.id,
              topicId: b.topic_id,
              type: b.type,
              content: b.content,
              sourceUrl: b.source_url ?? undefined,
              sourceTitle: b.source_title ?? undefined,
              imageUrl: b.image_url ?? undefined,
              ocrText: b.ocr_text ?? null,
              order: b.order ?? 0,
              isPinned: b.is_pinned ?? false,
              tags: b.tags ?? [],
              createdAt: new Date(b.created_at),
              updatedAt: new Date(b.updated_at),
              syncStatus: "synced",
            };
            await db.blocks.put(mapped);
          }
        }
      }

      // Pull collections
      const { data: collections } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id);

      if (collections) {
        for (const c of collections) {
          await db.collections.put({
            id: c.id,
            name: c.name,
            topicIds: c.topic_ids ?? [],
            createdAt: new Date(c.created_at),
          });
        }
      }
    } catch (err) {

      // Sync failure is non-fatal — local data is still intact
      console.warn("[DevMind] Pull from server failed:", err);
    }
  }, [user]);

  /**
   * Push all pending blocks to Supabase.
   * Sets syncStatus = 'synced' on success.
   */
  const pushPending = useCallback(async () => {
    if (!user) return;

    try {
      const pendingBlocks = await db.blocks
        .where("syncStatus")
        .equals("pending")
        .toArray();

      for (const block of pendingBlocks) {
        const { error } = await supabase.from("blocks").upsert({
          id: block.id,
          user_id: user.id,
          topic_id: block.topicId,
          type: block.type,
          content: block.content,
          source_url: block.sourceUrl ?? null,
          source_title: block.sourceTitle ?? null,
          image_url: block.imageUrl ?? null,
          ocr_text: block.ocrText ?? null,
          order: block.order,
          is_pinned: block.isPinned,
          tags: block.tags,
          created_at: block.createdAt.toISOString(),
          updated_at: block.updatedAt.toISOString(),
          sync_status: "synced",
        });

        if (!error) {
          await db.blocks.update(block.id!, { syncStatus: "synced" });
        }
      }

      // Push pending topics
      const pendingTopics = await db.topics.toArray();
      for (const topic of pendingTopics) {
        await supabase.from("topics").upsert({
          id: topic.id,
          user_id: user.id,
          name: topic.name,
          colour: topic.colour,
          collection_id: topic.collectionId ?? null,
          created_at: topic.createdAt.toISOString(),
          updated_at: topic.updatedAt.toISOString(),
          mastery_percent: topic.masteryPercent,
        });
      }

      // Push pending collections
      const pendingCollections = await db.collections.toArray();
      for (const col of pendingCollections) {
        await supabase.from("collections").upsert({
          id: col.id,
          user_id: user.id,
          name: col.name,
          topic_ids: col.topicIds,
          created_at: col.createdAt.toISOString(),
        });
      }
    } catch (err) {
      console.warn("[DevMind] Push pending failed:", err);
    }

  }, [user]);

  // On mount: pull server data in background
  useEffect(() => {
    if (user) {
      pullFromServer();
    }
  }, [user, pullFromServer]);

  // Every 30 seconds: push any pending writes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(pushPending, 30_000);
    return () => clearInterval(interval);
  }, [user, pushPending]);

  return { pullFromServer, pushPending };
}
