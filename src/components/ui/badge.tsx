import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "green" | "outline" | "dark";

const tones: Record<BadgeTone, string> = {
  neutral: "border-transparent bg-surface text-secondary",
  green: "border-transparent bg-green-light text-green-dark",
  outline: "border-line bg-paper text-secondary",
  dark: "border-transparent bg-ink text-paper",
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
        "inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap",
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
        tone === "green" ? "bg-green" : tone === "dark" ? "bg-ink" : "bg-muted",
      )}
    />
  );
}
