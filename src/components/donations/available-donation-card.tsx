import Link from "next/link";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import type { DonationWithDonor } from "@/types";
import {
  CATEGORY_LABELS,
  FOOD_TYPE_LABELS,
} from "@/lib/constants";
import {
  cn,
  formatDateTime,
  formatQuantity,
  formatRelative,
  getDeadlineState,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/dashboard/status-badge";

export function AvailableDonationCard({
  donation,
}: {
  donation: DonationWithDonor;
}) {
  const deadlineState = getDeadlineState(donation.pickupDeadline);

  return (
    <Card className="group flex min-w-0 flex-col overflow-hidden transition-colors hover:border-line-strong">
      {donation.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={donation.imageUrl}
          alt={donation.title}
          className="h-36 w-full object-cover"
        />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <CategoryIcon category={donation.category} />
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-medium text-secondary">
                {donation.donor?.organizationName ?? "Food donor"}
              </p>
              <p className="truncate text-[10.5px] text-muted">
                {donation.city} · {CATEGORY_LABELS[donation.category]}
              </p>
            </div>
          </div>
          <Badge
            tone={donation.foodType === "vegetarian" ? "accent" : "outline"}
            className="shrink-0"
          >
            {FOOD_TYPE_LABELS[donation.foodType]}
          </Badge>
        </div>

        <h3 className="mt-3 text-[15px] font-semibold leading-5 text-ink">
          <Link
            href={`/ngo/donations/${donation.id}`}
            className="transition-colors group-hover:text-accent-strong"
          >
            {donation.title}
          </Link>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-muted">
          {donation.description}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3">
          <div>
            <dt className="text-[10.5px] text-muted">Available</dt>
            <dd className="tabular mt-0.5 text-[12px] font-medium text-ink">
              {formatQuantity(donation.quantity, donation.quantityUnit)}
            </dd>
          </div>
          <div>
            <dt className="text-[10.5px] text-muted">Pickup by</dt>
            <dd
              className={cn(
                "mt-0.5 text-[12px] font-medium",
                deadlineState === "soon" ? "text-accent-strong" : "text-ink",
              )}
            >
              {formatRelative(donation.pickupDeadline)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 text-[10.5px] text-muted">
            <CalendarClock className="size-3 shrink-0" strokeWidth={1.8} />
            <span className="truncate">
              Safe until {formatDateTime(donation.safeUntil)}
            </span>
          </span>
          <Link
            href={`/ngo/donations/${donation.id}`}
            className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-accent-strong hover:underline"
          >
            View
            <ArrowUpRight className="size-3.5" strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
