import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "outline" | "dark" | "info" | "warning";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface text-secondary",
  accent: "border-accent/60 bg-accent-soft text-accent-ink dark:border-accent/30",
  outline: "border-line-strong bg-transparent text-secondary",
  dark: "border-ink bg-ink text-paper",
  info: "border-line-strong bg-transparent text-secondary dark:border-sky-300/30 dark:bg-sky-300/10 dark:text-sky-200",
  warning: "border-line-strong bg-transparent text-secondary dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-200",
};

const dotColors: Record<BadgeTone, string> = {
  neutral: "bg-muted",
  accent: "bg-accent-ink",
  outline: "bg-muted",
  dark: "bg-ink",
  info: "bg-ink dark:bg-current",
  warning: "bg-ink dark:bg-current",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone = "neutral" }: { tone?: BadgeTone }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 rounded-full", dotColors[tone])}
    />
  );
}
