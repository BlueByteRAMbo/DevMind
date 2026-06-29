// ============================================================
// DevMind — Logo (real PNG)
// Served from /icons/DevMind logo.png (public folder).
// Import via Logo.tsx only — never import this directly.
// ============================================================

import React from "react";

interface LogoPlaceholderProps {
  size?: number;
}

export const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({
  size = 40,
}) => (
  <img
    src="/icons/DevMind logo.png"
    alt="DevMind logo"
    width={size}
    height={size}
    style={{ objectFit: "contain", borderRadius: size * 0.18 }}
    draggable={false}
  />
);

