import { Building2 } from "lucide-react";
import type { DonationWithDonor } from "@/types";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDateTime, formatQuantity, formatRelative } from "@/lib/utils";
import { CategoryIcon, DonationStatusBadge } from "@/components/dashboard/status-badge";

export function AdminDonationsTable({
  donations,
}: {
  donations: DonationWithDonor[];
}) {
  return (
    <>
      <div className="hidden lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Food
              </th>
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Donor
              </th>
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Quantity
              </th>
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Pickup
              </th>
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Assigned NGO
              </th>
              <th scope="col" className="pb-2.5 text-[11px] font-medium text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {donations.map((donation) => (
              <tr key={donation.id} className="align-top">
                <td className="py-3.5 pr-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIcon category={donation.category} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {donation.title}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] text-muted">
                        {CATEGORY_LABELS[donation.category]} · {donation.city}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="flex items-center gap-1.5 text-[12px] text-secondary">
                    <Building2 className="size-3.5 shrink-0 text-muted" strokeWidth={1.8} />
                    <span className="truncate">
                      {donation.donor?.organizationName ?? "Unknown donor"}
                    </span>
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="tabular text-[12.5px] text-secondary">
                    {formatQuantity(donation.quantity, donation.quantityUnit)}
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="block text-[12px] text-secondary">
                    {formatDateTime(donation.pickupDeadline)}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-muted">
                    {formatRelative(donation.pickupDeadline)}
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-[12px] text-secondary">
                    {donation.assignedNgo?.organizationName ?? "—"}
                  </span>
                </td>
                <td className="py-3.5">
                  <DonationStatusBadge status={donation.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line lg:hidden">
        {donations.map((donation) => (
          <li key={donation.id} className="py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <CategoryIcon category={donation.category} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {donation.title}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-muted">
                    {CATEGORY_LABELS[donation.category]} · {donation.city}
                  </span>
                </span>
              </div>
              <DonationStatusBadge status={donation.status} className="shrink-0" />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11.5px]">
              <div>
                <dt className="text-muted">Donor</dt>
                <dd className="mt-0.5 truncate text-secondary">
                  {donation.donor?.organizationName ?? "Unknown donor"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Quantity</dt>
                <dd className="mt-0.5 tabular text-secondary">
                  {formatQuantity(donation.quantity, donation.quantityUnit)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Pickup by</dt>
                <dd className="mt-0.5 text-secondary">
                  {formatDateTime(donation.pickupDeadline)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Assigned NGO</dt>
                <dd className="mt-0.5 truncate text-secondary">
                  {donation.assignedNgo?.organizationName ?? "Not assigned"}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
