import Link from "next/link";
import { Compass } from "lucide-react";
import type { DonationWithDonor } from "@/types";
import { formatQuantity, formatRelative, getDeadlineState, cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryIcon } from "./status-badge";

export function NearbyDonationList({
  donations,
}: {
  donations: DonationWithDonor[];
}) {
  if (donations.length === 0) {
    return (
      <EmptyState
        icon={Compass}
        title="No available donations"
        description="New surplus food listings will appear here as soon as donors publish them."
        className="py-8"
      />
    );
  }

  return (
    <ul className="-my-2 divide-y divide-line">
      {donations.map((donation) => {
        const deadlineState = getDeadlineState(donation.pickupDeadline);

        return (
          <li key={donation.id}>
            <Link
              href={`/ngo/donations/${donation.id}`}
              className="group -mx-2 flex items-center gap-3 rounded-control px-2 py-3 transition-colors hover:bg-canvas"
            >
              <CategoryIcon category={donation.category} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink group-hover:text-green-dark">
                  {donation.title}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">
                  {donation.donor?.organizationName ?? "Food donor"} ·{" "}
                  {donation.city}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="tabular block text-[12px] font-medium text-ink">
                  {formatQuantity(donation.quantity, donation.quantityUnit)}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-[10.5px]",
                    deadlineState === "soon"
                      ? "font-medium text-green-dark"
                      : "text-muted",
                  )}
                >
                  {formatRelative(donation.pickupDeadline)}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
