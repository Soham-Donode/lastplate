import type { DonationStatusCounts } from "@/types";
import { collectionRate } from "@/lib/data/compute";
import { cn } from "@/lib/utils";

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

export function CollectionSummary({
  counts,
}: {
  counts: DonationStatusCounts;
}) {
  const rate = collectionRate(counts);
  const active = counts.available + counts.assigned;
  const considered = counts.collected + active + counts.expired;
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
          aria-label={`${rate}% of listings collected`}
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
            stroke="var(--color-accent-ink)"
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
          <span className="mt-1 text-[10.5px] text-muted">collected</span>
        </div>
      </div>

      <div className="w-full min-w-0">
        <ul className="space-y-2.5">
          <LegendRow
            label="Collected"
            value={counts.collected}
            dotClassName="bg-accent-ink"
          />
          <LegendRow
            label="Active listings"
            value={active}
            dotClassName="bg-ink/70"
          />
          <LegendRow
            label="Expired"
            value={counts.expired}
            dotClassName="bg-line-strong"
          />
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-[11px] leading-4 text-muted">
          Based on {considered} listings that were active, collected or
          expired. Cancelled listings are excluded.
        </p>
      </div>
    </div>
  );
}
