// ============================================================
// DevMind — CollectionsPanel Component
// Collapsible section in the sidebar for creating and managing
// collections (groups of topics).
// ============================================================

import React, { useEffect, useState, useCallback } from "react";
import type { Topic, Collection } from "../../types";
import { useCollections } from "../../hooks/useCollections";
import { useAppStore } from "../../store/appStore";
import { db } from "../../lib/db";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";

export const CollectionsPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { getAll, create, remove, rename, toggleTopic } = useCollections();
  const setSelectedTopicId = useAppStore((s) => s.setSelectedTopicId);

  const load = useCallback(async () => {
    const [cols, tops] = await Promise.all([getAll(), db.topics.toArray()]);
    setCollections(cols);
    setTopics(tops);
  }, [getAll]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await create(newName.trim());
    setNewName("");
    setCreating(false);
    load();
  };

  const confirmDelete = async () => {
    if (pendingDeleteId) {
      await remove(pendingDeleteId);
      setPendingDeleteId(null);
      load();
    }
  };

  const handleRename = async (id: string) => {
    const col = collections.find((c) => c.id === id);
    if (!col) return;
    const n = prompt("Rename collection:", col.name);
    if (n && n.trim() && n.trim() !== col.name) {
      await rename(id, n.trim());
      load();
    }
  };

  const handleToggleTopic = async (colId: string, topicId: string) => {
    await toggleTopic(colId, topicId);
    load();
  };

  return (
    <div className="border-t border-border">
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-body transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 icon-glow text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Collections
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-2 pb-3 space-y-1">
          {/* Collection list */}
          {collections.length === 0 && !creating && (
            <p className="text-xs text-text-muted text-center py-2">No collections yet.</p>
          )}

          {collections.map((col) => {
            const colTopics = topics.filter((t) => col.topicIds.includes(t.id));
            const isExpanded = expandedId === col.id;

            return (
              <div key={col.id} className="rounded-lg border border-border overflow-hidden">
                {/* Collection row */}
                <div className="flex items-center gap-2 px-3 py-2 bg-bg-card hover:bg-bg-hover transition-colors group">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : col.id!)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                  >
                    <svg
                      className={`w-3 h-3 text-text-muted flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs text-text-body truncate font-medium">{col.name}</span>
                    <span className="text-[10px] text-text-muted ml-auto flex-shrink-0">
                      {colTopics.length}
                    </span>
                  </button>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                    <button
                      onClick={() => handleRename(col.id!)}
                      className="p-0.5 text-text-muted hover:text-text-body rounded"
                      title="Rename"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPendingDeleteId(col.id!)}
                      className="p-0.5 text-text-muted hover:text-accent-red hover:drop-shadow-[0_0_8px_currentColor] rounded"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded: topic checklist + member list */}
                {isExpanded && (
                  <div className="border-t border-border bg-bg-base">
                    {/* Assigned topics (clickable) */}
                    {colTopics.length > 0 && (
                      <div className="px-3 py-2 space-y-1">
                        {colTopics.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTopicId(t.id)}
                            className="w-full flex items-center gap-2 text-left hover:bg-bg-hover rounded px-1.5 py-1 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.colour }} />
                            <span className="text-xs text-text-body truncate">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Add/remove topics */}
                    <div className="border-t border-border px-3 py-2">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">Add topics</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {topics.map((t) => {
                          const inCol = col.topicIds.includes(t.id);
                          return (
                            <label
                              key={t.id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-bg-hover rounded px-1 py-0.5 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={inCol}
                                onChange={() => handleToggleTopic(col.id!, t.id)}
                                className="accent-[#7C6AF7] w-3 h-3 rounded"
                              />
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.colour }} />
                              <span className="text-xs text-text-body truncate">{t.name}</span>
                            </label>
                          );
                        })}
                        {topics.length === 0 && (
                          <p className="text-xs text-text-muted">No topics to add.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Inline create form */}
          {creating ? (
            <div className="flex gap-1.5 items-center px-1">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") { setCreating(false); setNewName(""); }
                }}
                placeholder="Collection name..."
                className="flex-1 bg-bg-card border border-accent-purple/40 rounded px-2 py-1 text-xs text-text-body outline-none"
                maxLength={40}
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="text-xs px-2 py-1 rounded bg-accent-purple text-white disabled:opacity-40 hover:bg-accent-purple2 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setCreating(false); setNewName(""); }}
                className="text-xs px-1.5 py-1 rounded text-text-muted hover:text-text-body transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted hover:text-text-body hover:bg-bg-hover rounded-lg transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Collection
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Collection"
        message="Are you sure you want to delete this collection? This will not delete the topics inside it."
      />
    </div>
  );
};
