// ============================================================
// DevMind — Spinner Component
// ============================================================

import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5 border-[1.5px]",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-2",
};

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => (
  <span
    className={[
      "animate-spin rounded-full border-accent-purple border-t-transparent inline-block",
      sizeClasses[size],
      className,
    ].join(" ")}
    role="status"
    aria-label="Loading"
  />
);
