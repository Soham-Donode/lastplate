import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-subtle flex flex-col items-center justify-center rounded-card border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <span className="glass-well mb-4 inline-flex size-11 items-center justify-center rounded-full text-muted">
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </span>
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-[13px] leading-5 text-muted">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
