// ============================================================
// DevMind — Logo Wrapper
// Import THIS file everywhere. Never import LogoPlaceholder directly.
// When the real PNG is ready, only this file changes.
// ============================================================

import React from "react";
import { LogoPlaceholder } from "./LogoPlaceholder";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkSize?: "sm" | "md" | "lg";
}

const wordmarkClasses = {
  sm: "text-[13px]",
  md: "text-[15px]",
  lg: "text-2xl",
};

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  showWordmark = false,
  wordmarkSize = "md",
}) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <LogoPlaceholder size={size} />
      {showWordmark && (
        <span
          className={`font-bold tracking-tight ${wordmarkClasses[wordmarkSize]}`}
          style={{ lineHeight: 1 }}
        >
          <span className="text-text-primary">Dev</span>
          <span className="text-gradient-brand">Mind</span>
        </span>
      )}
    </div>
  );
};
