import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "accent" | "outline" | "dark";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface text-secondary",
  accent: "border-accent/60 bg-accent-soft text-accent-ink",
  outline: "border-line-strong bg-transparent text-secondary",
  dark: "border-ink bg-ink text-paper",
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
      className={cn(
        "size-1.5 rounded-full",
        tone === "accent"
          ? "bg-accent-ink"
          : tone === "dark"
            ? "bg-ink"
            : "bg-muted",
      )}
    />
  );
}
