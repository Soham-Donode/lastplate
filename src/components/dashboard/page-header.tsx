import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  icon: Icon,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-4 pb-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 text-[26px] font-semibold leading-8 tracking-[-0.03em] text-ink sm:text-[30px]">
          {Icon && (
            <Icon
              aria-hidden="true"
              className="hidden size-6 text-muted sm:block"
              strokeWidth={1.6}
            />
          )}
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 sm:shrink-0",
            "[&>*]:flex-1 sm:[&>*]:flex-none",
          )}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
