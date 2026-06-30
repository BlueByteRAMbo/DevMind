// ============================================================
// DevMind — Canvas Component
// Renders all blocks for the selected topic.
// Supports drag-and-drop reordering with @dnd-kit.
// ============================================================

import React, { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { KeyboardSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "../../types";
import { useBlocks } from "../../hooks/useBlocks";
import { useAppStore } from "../../store/appStore";
import { AddBlockRow } from "./AddBlockRow";
import { NoteBlock } from "../blocks/NoteBlock";
import { AIBlock } from "../blocks/AIBlock";
import { URLBlock } from "../blocks/URLBlock";
import { YouTubeBlock } from "../blocks/YouTubeBlock";
import { HandwrittenBlock } from "../blocks/HandwrittenBlock";
import { SynthesisBlock } from "../blocks/SynthesisBlock";
import { BlockSkeleton } from "../ui/Skeleton";

// ── Sortable wrapper ──────────────────────────────────────────
interface SortableBlockProps {
  block: Block;
  onDeleted: () => void;
}

const SortableBlock: React.FC<SortableBlockProps> = ({ block, onDeleted }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id! });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const blockComponent = (() => {
    switch (block.type) {
      case "own_note":         return <NoteBlock block={block} onDeleted={onDeleted} />;
      case "ai_response":      return <AIBlock block={block} onDeleted={onDeleted} />;
      case "url_clip":         return <URLBlock block={block} onDeleted={onDeleted} />;
      case "youtube_note":     return <YouTubeBlock block={block} onDeleted={onDeleted} />;
      case "handwritten_scan": return <HandwrittenBlock block={block} onDeleted={onDeleted} />;
      case "synthesis":        return <SynthesisBlock block={block} onDeleted={onDeleted} />;
      default:                 return null;
    }
  })();

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 p-1 text-text-muted opacity-0 group-hover:opacity-100 hover:text-text-body transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zm-6 6a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zm-6 6a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4z"/>
        </svg>
      </button>
      {blockComponent}
    </div>
  );
};

// ── Canvas ─────────────────────────────────────────────────────
export const Canvas: React.FC = () => {
  const selectedTopicId = useAppStore((s) => s.selectedTopicId);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAll, reorder } = useBlocks();

  const loadBlocks = useCallback(async () => {
    if (!selectedTopicId) {
      setBlocks([]);
      setLoading(false);
      return;
    }
    const data = await getAll(selectedTopicId);
    setBlocks(data);
    setLoading(false);
  }, [selectedTopicId, getAll]);

  useEffect(() => {
    setLoading(true);
    loadBlocks();
    const interval = setInterval(loadBlocks, 1500);
    return () => clearInterval(interval);
  }, [loadBlocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(reordered); // optimistic
      await reorder(selectedTopicId!, reordered.map((b) => b.id!));
    },
    [blocks, reorder, selectedTopicId]
  );

  if (!selectedTopicId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="opacity-10 text-[80px] select-none">🧠</div>
        <h2 className="text-text-primary text-lg font-semibold">Nothing here yet.</h2>
        <p className="text-text-muted text-sm max-w-xs">
          Select a topic from the sidebar, or create a new one to start building your knowledge.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Block list */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-3">
        {loading ? (
          <>
            <BlockSkeleton />
            <BlockSkeleton />
          </>
        ) : blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
            <div className="opacity-10 text-[64px] select-none">📭</div>
            <p className="text-text-muted text-sm">
              Nothing here yet. Start by adding a block below.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id!)}
              strategy={verticalListSortingStrategy}
            >
              <div id="canvas-blocks-container" className="space-y-3 pl-6 pb-6 bg-bg-base">
                {blocks.map((block) => (
                  <div key={block.id} className="group">
                    <SortableBlock
                      block={block}
                      onDeleted={loadBlocks}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add block row — always visible at the bottom */}
      <AddBlockRow onBlockAdded={loadBlocks} />
    </div>
  );
};
