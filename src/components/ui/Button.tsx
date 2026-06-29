// ============================================================
// DevMind — Button Component
// Never uses hardcoded colours. All styling via Tailwind tokens.
// ============================================================

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "teal" | "amber";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent-purple text-white hover:bg-accent-purple2 active:scale-95 shadow-lg shadow-accent-purple/20",
  secondary:
    "bg-bg-card border border-border text-text-body hover:bg-bg-hover hover:border-border-strong active:scale-95",
  ghost:
    "bg-transparent text-text-subtle hover:text-text-body hover:bg-bg-hover active:scale-95",
  danger:
    "bg-accent-red/10 border border-accent-red/30 text-accent-red hover:bg-accent-red/20 active:scale-95",
  teal:
    "bg-accent-teal/10 border border-accent-teal/30 text-accent-teal hover:bg-accent-teal/20 active:scale-95",
  amber:
    "bg-accent-amber/10 border border-accent-amber/30 text-accent-amber hover:bg-accent-amber/20 active:scale-95",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 px-3 text-xs gap-1.5 rounded-md",
  md: "h-8 px-4 text-sm gap-2 rounded-lg",
  lg: "h-10 px-5 text-sm gap-2 rounded-lg",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = "",
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-medium",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...rest}
    >
      {isLoading ? (
        <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        leftIcon
      )}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon}
    </button>
  );
};
