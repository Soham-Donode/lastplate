import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Donation } from "@/types";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDateTime, formatQuantity, formatRelative } from "@/lib/utils";
import { CategoryIcon, DonationStatusBadge } from "./status-badge";

export function DonationsTable({ donations }: { donations: Donation[] }) {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <th
                scope="col"
                className="pb-2.5 pr-4 text-[11px] font-medium text-muted"
              >
                Food
              </th>
              <th
                scope="col"
                className="pb-2.5 pr-4 text-[11px] font-medium text-muted"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="pb-2.5 pr-4 text-[11px] font-medium text-muted"
              >
                Pickup by
              </th>
              <th
                scope="col"
                className="pb-2.5 pr-4 text-[11px] font-medium text-muted"
              >
                Status
              </th>
              <th scope="col" className="w-8 pb-2.5">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {donations.map((donation) => (
              <tr
                key={donation.id}
                className="group transition-colors hover:bg-canvas/70"
              >
                <td className="py-3 pr-4">
                  <Link
                    href={`/donor/donations/${donation.id}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <CategoryIcon category={donation.category} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink group-hover:text-green-dark">
                        {donation.title}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] text-muted">
                        {CATEGORY_LABELS[donation.category]}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <span className="tabular text-[12.5px] text-secondary">
                    {formatQuantity(donation.quantity, donation.quantityUnit)}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className="block text-[12px] text-secondary">
                    {formatDateTime(donation.pickupDeadline)}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-muted">
                    {formatRelative(donation.pickupDeadline)}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <DonationStatusBadge status={donation.status} />
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/donor/donations/${donation.id}`}
                    aria-label={`Open ${donation.title}`}
                    className="inline-flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
                  >
                    <ChevronRight className="size-4" strokeWidth={1.8} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {donations.map((donation) => (
          <li key={donation.id}>
            <Link
              href={`/donor/donations/${donation.id}`}
              className="-mx-2 block rounded-control px-2 py-3 transition-colors hover:bg-canvas"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {donation.title}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-muted">
                    {CATEGORY_LABELS[donation.category]}
                  </span>
                </span>
                <DonationStatusBadge
                  status={donation.status}
                  className="shrink-0"
                />
              </span>
              <span className="mt-2 flex items-center gap-2 text-[11.5px] text-muted">
                <span className="tabular text-secondary">
                  {formatQuantity(donation.quantity, donation.quantityUnit)}
                </span>
                <span aria-hidden="true" className="text-line-strong">
                  ·
                </span>
                <span>Pickup {formatRelative(donation.pickupDeadline)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
