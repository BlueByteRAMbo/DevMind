// ============================================================
// DevMind — Floating Action Button (Camera FAB)
// Bottom‑right glassmorphic button for future scan upload.
// ============================================================

import React from "react";
import { Button } from "../ui/Button";

interface FloatingActionButtonProps {
  /** Optional click handler */
  onClick?: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) onClick();
    else console.log("FAB clicked – implement scan modal");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        variant="primary"
        size="lg"
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:scale-110 transition-transform"
        onClick={handleClick}
        aria-label="Add scan"
        title="Add scan"
      >
        {/* Camera icon */}
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7h4l3 5h8l3-5h4M12 13v6m-3-3h6"
          />
        </svg>
      </Button>
    </div>
  );
};
