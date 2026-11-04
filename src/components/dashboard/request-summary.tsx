import type { CollectionRequestCounts } from "@/types";
import { cn, percent } from "@/lib/utils";

function LegendRow({
  label,
  value,
  dotClassName,
}: {
  label: string;
  value: number;
  dotClassName: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-[12px]">
      <span className="flex items-center gap-2 text-secondary">
        <span
          aria-hidden="true"
          className={cn("size-2 rounded-full", dotClassName)}
        />
        {label}
      </span>
      <span className="tabular font-medium text-ink">{value}</span>
    </li>
  );
}

export function RequestSummary({
  counts,
}: {
  counts: CollectionRequestCounts;
}) {
  const total =
    counts.pending +
    counts.accepted +
    counts.completed +
    counts.rejected +
    counts.cancelled;
  const rate = percent(counts.completed, total);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - rate / 100);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-7">
      <div className="relative shrink-0">
        <svg
          width="132"
          height="132"
          viewBox="0 0 132 132"
          role="img"
          aria-label={`${rate}% of collection requests completed`}
          className="-rotate-90"
        >
          <circle
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            stroke="var(--color-subtle)"
            strokeWidth="11"
          />
          <circle
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            stroke="var(--color-green)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-[26px] font-semibold leading-none tracking-[-0.03em] text-ink">
            {rate}%
          </span>
          <span className="mt-1 text-[10.5px] text-muted">completed</span>
        </div>
      </div>

      <div className="w-full min-w-0">
        <ul className="space-y-2.5">
          <LegendRow
            label="Pending"
            value={counts.pending}
            dotClassName="bg-ink/70"
          />
          <LegendRow
            label="Accepted"
            value={counts.accepted}
            dotClassName="bg-green/60"
          />
          <LegendRow
            label="Completed"
            value={counts.completed}
            dotClassName="bg-green"
          />
          <LegendRow
            label="Closed"
            value={counts.rejected + counts.cancelled}
            dotClassName="bg-line-strong"
          />
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-[11px] leading-4 text-muted">
          Based on {total} {total === 1 ? "request" : "requests"} sent by your
          organization.
        </p>
      </div>
    </div>
  );
}
