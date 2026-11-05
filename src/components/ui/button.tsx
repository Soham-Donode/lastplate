import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "subtle" | "inverse";
type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-accent-solid-hover bg-accent-solid text-[#0d3446] shadow-[0_10px_22px_-14px_rgb(20_85_111/0.55)] hover:bg-accent-solid-hover active:translate-y-px",
  secondary:
    "border border-line-strong bg-paper text-ink hover:border-line-strong hover:bg-surface active:translate-y-px",
  ghost:
    "border border-transparent text-secondary hover:bg-surface hover:text-ink",
  subtle:
    "border border-line bg-surface text-ink hover:bg-subtle",
  inverse:
    "border border-transparent bg-white text-[#14556f] hover:bg-white/90 active:translate-y-px",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-10 px-4 text-[13.5px]",
  lg: "h-11 px-5 text-sm",
  icon: "size-10",
  "icon-sm": "size-8",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
