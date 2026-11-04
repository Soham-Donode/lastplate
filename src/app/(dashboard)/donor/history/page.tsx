import Link from "next/link";
import { History, Leaf, PackageCheck } from "lucide-react";
import { requireDonor } from "@/lib/auth";
import { getDonorRepository } from "@/lib/data";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDateTime, formatQuantity } from "@/lib/utils";

export const metadata = {
  title: "Collection history",
};

export default async function HistoryPage() {
  const profile = await requireDonor();
  const records = await getDonorRepository().listHistory(profile.id);
  const totalKg = records
    .filter((record) => record.quantityUnit === "kg")
    .reduce((total, record) => total + record.collectedQuantity, 0);
  const partners = new Set(records.map((record) => record.ngoId)).size;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Collection history"
        description="A record of every completed pickup from your kitchen. Completed donations stay here permanently."
        actions={
          <Link
            href="/donor/donations"
            className={buttonStyles({ variant: "secondary" })}
          >
            <PackageCheck className="size-4" strokeWidth={1.8} />
            View donations
          </Link>
        }
      />

      {records.length === 0 ? (
        <Card className="p-5 sm:p-6">
          <EmptyState
            icon={History}
            title="No collections recorded yet"
            description="Once an assigned donation is marked as collected, it will appear in this history."
            action={
              <Link
                href="/donor/donations"
                className={buttonStyles({ variant: "secondary" })}
              >
                View active donations
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-card border border-line bg-paper p-5">
              <p className="text-[11.5px] text-muted">Collections completed</p>
              <p className="tabular mt-2 text-[26px] font-semibold leading-none text-ink">
                {records.length}
              </p>
            </div>
            <div className="rounded-card border border-line bg-paper p-5">
              <p className="text-[11.5px] text-muted">Food rescued</p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="tabular text-[26px] font-semibold leading-none text-ink">
                  {formatQuantity(totalKg)}
                </span>
                <span className="text-[12px] text-muted">kg</span>
              </p>
            </div>
            <div className="rounded-card border border-line bg-paper p-5">
              <p className="text-[11.5px] text-muted">Partner NGOs</p>
              <p className="tabular mt-2 text-[26px] font-semibold leading-none text-ink">
                {partners}
              </p>
            </div>
          </div>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-1.5">
              <Leaf className="size-3.5 text-green-text" strokeWidth={1.8} />
              <p className="text-[11.5px] text-muted">
                Every completed collection is recorded with its quantity and
                partner organization.
              </p>
            </div>

            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                      Food
                    </th>
                    <th className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                      Collected by
                    </th>
                    <th className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                      Quantity
                    </th>
                    <th className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                      Collected
                    </th>
                    <th className="pb-2.5 text-[11px] font-medium text-muted">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="py-3 pr-4">
                        <span className="block text-[13px] font-medium text-ink">
                          {record.donation?.title ?? "Donation removed"}
                        </span>
                        <span className="mt-0.5 block text-[10.5px] text-muted">
                          {record.donation
                            ? CATEGORY_LABELS[record.donation.category]
                            : "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-secondary">
                        {record.ngo?.organizationName ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-[12.5px] text-secondary tabular">
                        {formatQuantity(
                          record.collectedQuantity,
                          record.quantityUnit,
                        )}
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-secondary">
                        {formatDateTime(record.collectedAt)}
                      </td>
                      <td className="max-w-[220px] py-3 text-[11.5px] leading-5 text-muted">
                        {record.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {records.map((record) => (
                <li key={record.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {record.donation?.title ?? "Donation removed"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {record.ngo?.organizationName ?? "—"} ·{" "}
                        {formatDateTime(record.collectedAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12px] font-medium text-secondary tabular">
                      {formatQuantity(
                        record.collectedQuantity,
                        record.quantityUnit,
                      )}
                    </span>
                  </div>
                  {record.notes && (
                    <p className="mt-1.5 text-[11px] leading-5 text-muted">
                      {record.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
