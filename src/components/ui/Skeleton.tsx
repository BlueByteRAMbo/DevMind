// ============================================================
// DevMind — Skeleton Component
// Used for loading states across all async operations.
// ============================================================

import React from "react";

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: "sm" | "md" | "lg" | "full";
  lines?: number;
}

const roundedClasses = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  height = "h-4",
  width = "w-full",
  rounded = "md",
  lines,
}) => {
  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={[
              "skeleton-shimmer",
              height,
              i === lines - 1 ? "w-3/4" : "w-full",
              roundedClasses[rounded],
              className,
            ].join(" ")}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={[
        "skeleton-shimmer",
        height,
        width,
        roundedClasses[rounded],
        className,
      ].join(" ")}
    />
  );
};

/** Pre-built skeleton for a block card */
export const BlockSkeleton: React.FC = () => (
  <div className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
    <div className="flex items-center gap-2">
      <Skeleton height="h-5" width="w-16" rounded="full" />
      <Skeleton height="h-5" width="w-24" rounded="full" />
    </div>
    <Skeleton lines={3} />
  </div>
);
