import { cn, initials } from "@/lib/utils";

const sizes = {
  sm: "size-8 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-10 text-[13px]",
} as const;

export function Avatar({
  name,
  size = "md",
  tone = "neutral",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  tone?: "neutral" | "green";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border font-medium tracking-wide select-none",
        tone === "green"
          ? "border-green/15 bg-green-light text-green-dark"
          : "border-line bg-surface text-secondary",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
