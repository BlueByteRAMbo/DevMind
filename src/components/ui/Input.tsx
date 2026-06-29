// ============================================================
// DevMind — Input Component
// ============================================================

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  className = "",
  id,
  ...rest
}) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-subtle uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-text-muted pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={[
            "w-full h-9 rounded-lg border border-border bg-bg-card",
            "text-sm text-text-body placeholder:text-text-muted",
            "px-3 py-2 transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            leftIcon ? "pl-9" : "",
            error ? "border-accent-red focus:ring-accent-red/50 focus:border-accent-red" : "",
            className,
          ].join(" ")}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  );
};
