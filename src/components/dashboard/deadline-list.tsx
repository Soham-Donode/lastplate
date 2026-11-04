import Link from "next/link";
import { CalendarClock, Clock3 } from "lucide-react";
import type { Donation } from "@/types";
import {
  formatDayNumber,
  formatMonth,
  formatQuantity,
  formatRelative,
  formatTime,
  getDeadlineState,
  cn,
} from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export function DeadlineList({
  donations,
  hrefBase = "/donor/donations",
  emptyTitle = "No upcoming pickups",
  emptyDescription = "Active listings with a future pickup deadline will appear here.",
}: {
  donations: Donation[];
  hrefBase?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (donations.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title={emptyTitle}
        description={emptyDescription}
        className="py-8"
      />
    );
  }

  return (
    <ul className="-my-2 divide-y divide-line">
      {donations.map((donation) => {
        const state = getDeadlineState(donation.pickupDeadline);

        return (
          <li key={donation.id}>
            <Link
              href={`${hrefBase}/${donation.id}`}
              className="group -mx-2 flex items-center gap-3 rounded-control px-2 py-3 transition-colors hover:bg-canvas"
            >
              <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-control bg-surface">
                <span className="tabular text-[14px] font-semibold leading-4 text-ink">
                  {formatDayNumber(donation.pickupDeadline)}
                </span>
                <span className="text-[9.5px] font-medium uppercase tracking-wide text-muted">
                  {formatMonth(donation.pickupDeadline)}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink group-hover:text-green-dark">
                  {donation.title}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                  <Clock3
                    aria-hidden="true"
                    className="size-3 shrink-0"
                    strokeWidth={1.8}
                  />
                  {formatTime(donation.pickupDeadline)} ·{" "}
                  {formatQuantity(donation.quantity, donation.quantityUnit)}
                </span>
              </span>

              <span
                className={cn(
                  "shrink-0 text-[10.5px] font-medium",
                  state === "soon" ? "text-green-dark" : "text-muted",
                )}
              >
                {formatRelative(donation.pickupDeadline)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
