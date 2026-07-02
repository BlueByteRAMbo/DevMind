// ============================================================
// DevMind — Badge Component
// Block-type colour coding via the design token system.
// ============================================================

import React from "react";
import type { BlockType } from "../../types";

interface BadgeProps {
  type: BlockType;
  className?: string;
}

const badgeConfig: Record<
  BlockType,
  { label: string; classes: string }
> = {
  ai_response: {
    label: "AI Response",
    classes: "bg-accent-purple/15 text-accent-purple border border-accent-purple/30",
  },
  url_clip: {
    label: "URL Clip",
    classes: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  youtube_note: {
    label: "YouTube",
    classes: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
  handwritten_scan: {
    label: "Handwritten",
    classes: "bg-accent-amber/15 text-accent-amber border border-accent-amber/30",
  },
  own_note: {
    label: "Note",
    classes: "bg-border/40 text-text-subtle border border-border",
  },
  synthesis: {
    label: "Synthesis",
    classes: "bg-accent-teal/15 text-accent-teal border border-accent-teal/30",
  },
  link: {
    label: "Link",
    classes: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
  },
};

export const Badge: React.FC<BadgeProps> = ({ type, className = "" }) => {
  const { label, classes } = badgeConfig[type];
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide",
        classes,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
};
