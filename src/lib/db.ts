// ============================================================
// DevMind — Dexie.js (IndexedDB) Database
// Local-first: all reads are instant, writes go here first.
// ============================================================

import Dexie from "dexie";
import type { Table } from "dexie";
import type { Topic, Block, Collection } from "../types";

export class DevMindDB extends Dexie {
  topics!: Table<Topic, string>;
  blocks!: Table<Block, string>;
  collections!: Table<Collection, string>;

  constructor() {
    super("devmind");

    this.version(1).stores({
      topics:
        "id, name, colour, collectionId, createdAt, updatedAt, masteryPercent",
      blocks:
        "id, topicId, type, content, sourceUrl, sourceTitle, imageUrl, ocrText, order, isPinned, tags, createdAt, updatedAt, syncStatus",
      collections: "id, name, topicIds, createdAt",
    });
  }
}

export const db = new DevMindDB();
