// ============================================================
// DevMind — TopicSidebar Component
// Left-side panel listing all topics with create dialog.
// ============================================================

import React, { useEffect, useState, useCallback } from "react";
import type { Topic } from "../../types";
import { useTopics } from "../../hooks/useTopics";
import { useAppStore } from "../../store/appStore";
import { TopicItem } from "./TopicItem";
import { CollectionsPanel } from "./CollectionsPanel";
import { Logo } from "../ui/Logo";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Skeleton } from "../ui/Skeleton";

const TOPIC_COLOURS = [
  "#7C6AF7", "#F0904D", "#3ECFAD", "#E05C5C", "#4DB87A",
  "#C45EE0", "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6",
];

export const TopicSidebar: React.FC = () => {
  const { getAll, create, remove, update } = useTopics();
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const user = useAppStore((s) => s.user);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColour, setNewColour] = useState(TOPIC_COLOURS[0]);
  const [creating, setCreating] = useState(false);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (pendingDeleteId) {
      await remove(pendingDeleteId);
      await loadTopics();
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };


  const loadTopics = useCallback(async () => {
    const all = await getAll();
    setTopics(all);
    setLoading(false);
  }, [getAll]);

  useEffect(() => {
    loadTopics();
    // Poll for changes every 2 seconds (lightweight local polling)
    const interval = setInterval(loadTopics, 2000);
    return () => clearInterval(interval);
  }, [loadTopics]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await create(newName.trim(), newColour);
    setNewName("");
    setNewColour(TOPIC_COLOURS[0]);
    setShowCreate(false);
    setCreating(false);
    await loadTopics();
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    await loadTopics();
  };

  const handleRename = async (id: string, newName: string) => {
    await update(id, { name: newName });
    await loadTopics();
  };


  return (
    <aside className="flex flex-col h-full bg-bg-surface border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <Logo size={24} showWordmark wordmarkSize="sm" />
        {/* Mobile close button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden text-text-muted hover:text-text-body transition-colors p-1 rounded"
          aria-label="Close sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* New Topic button */}
      <div className="px-3 pt-3 pb-2">
        <Button
          id="btn-new-topic"
          variant="primary"
          size="sm"
          onClick={() => setShowCreate(true)}
          className="w-full justify-center"
          leftIcon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Topic
        </Button>
      </div>

      {/* Topic list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {loading ? (
          <div className="space-y-1.5 px-1 mt-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="h-9" rounded="lg" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-3">
            <span className="text-text-muted text-xs">No topics yet.</span>
            <span className="text-text-muted text-xs">Click "New Topic" to start.</span>
          </div>
        ) : (
          topics.map((topic) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              onDelete={handleDelete}
              onRename={handleRename}
              onDeletePending={setPendingDeleteId}
            />
          ))
        )}
      </div>

      {/* Collections */}
      <CollectionsPanel />

      {/* Footer: user info */}
      {user && (
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[11px] text-text-muted truncate">{user.email}</p>
        </div>
      )}

      {/* Create Topic Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Topic"
      >
        <div className="space-y-4">
          <Input
            id="new-topic-name"
            label="Topic name"
            placeholder="e.g. JWT Authentication"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-subtle uppercase tracking-wider">
              Colour
            </label>
            <div className="flex gap-2 flex-wrap">
              {TOPIC_COLOURS.map((colour) => (
                <button
                  key={colour}
                  onClick={() => setNewColour(colour)}
                  className={[
                    "w-6 h-6 rounded-full transition-transform",
                    newColour === colour ? "scale-125 ring-2 ring-white/40" : "hover:scale-110",
                  ].join(" ")}
                  style={{ backgroundColor: colour }}
                  aria-label={`Select colour ${colour}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="ghost"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button
              id="btn-create-topic-confirm"
              variant="primary"
              onClick={handleCreate}
              isLoading={creating}
              disabled={!newName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {pendingDeleteId && (
        <Modal
          isOpen={true}
          onClose={cancelDelete}
          title="Delete Topic"
        >
          <p className="text-sm text-text-muted">Are you sure you want to delete this topic?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={cancelDelete}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={confirmDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </aside>
  );
};
