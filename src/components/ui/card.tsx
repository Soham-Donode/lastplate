import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "glass-surface glass-sheen glass-card rounded-card",
        className,
      )}
      {...props}
    />
  );
}

interface PanelProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headingLevel?: "h2" | "h3";
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  headingLevel: Heading = "h2",
}: PanelProps) {
  return (
    <Card className={cn("flex min-w-0 flex-col", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            {title && (
              <Heading className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                {title}
              </Heading>
            )}
            {description && (
              <p className="mt-1 text-[12px] leading-5 text-muted">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("flex-1 px-5 py-5 sm:px-6 sm:py-6", bodyClassName)}>
        {children}
      </div>
    </Card>
  );
}
