import Link from "next/link";
import { Compass, Leaf, PackageCheck } from "lucide-react";
import { requireNgo } from "@/lib/auth";
import { getNgoRepository } from "@/lib/data";
import { CATEGORY_LABELS } from "@/lib/constants";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryIcon } from "@/components/dashboard/status-badge";
import { formatDateTime, formatQuantity } from "@/lib/utils";

export const metadata = {
  title: "Collections",
};

export default async function NgoCollectionsPage() {
  const profile = await requireNgo();
  const records = await getNgoRepository().listCollections(profile.id);
  const foodCollected = records
    .filter((record) => record.quantityUnit === "kg")
    .reduce((total, record) => total + record.collectedQuantity, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Collections"
        description="Every completed pickup recorded by your organization."
        actions={
          <Link href="/ngo/explore" className={buttonStyles()}>
            <Compass className="size-4" strokeWidth={1.8} />
            Explore donations
          </Link>
        }
      />

      {records.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <Card className="p-5">
            <p className="flex items-center gap-1.5 text-[12px] text-muted">
              <PackageCheck className="size-3.5" strokeWidth={1.8} />
              Completed collections
            </p>
            <p className="tabular mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em] text-ink">
              {records.length}
            </p>
            <p className="mt-2 text-[11.5px] text-muted">
              Pickups confirmed by your team
            </p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-1.5 text-[12px] text-muted">
              <Leaf className="size-3.5" strokeWidth={1.8} />
              Food collected
            </p>
            <p className="tabular mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em] text-ink">
              {formatQuantity(foodCollected, "kg")}
            </p>
            <p className="mt-2 text-[11.5px] text-muted">
              Measured in kilograms across all pickups
            </p>
          </Card>
        </div>
      )}

      {records.length === 0 ? (
        <Card className="p-5 sm:p-6">
          <EmptyState
            icon={PackageCheck}
            title="No collections yet"
            description="After a donor accepts your request and your team collects the food, confirm the collection to record it here."
            action={
              <Link href="/ngo/explore" className={buttonStyles()}>
                <Compass className="size-4" strokeWidth={1.8} />
                Explore donations
              </Link>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line">
                  <th
                    scope="col"
                    className="px-5 pb-2.5 pt-4 text-[11px] font-medium text-muted sm:px-6"
                  >
                    Food
                  </th>
                  <th
                    scope="col"
                    className="px-4 pb-2.5 pt-4 text-[11px] font-medium text-muted"
                  >
                    Collected
                  </th>
                  <th
                    scope="col"
                    className="px-4 pb-2.5 pt-4 text-[11px] font-medium text-muted"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-5 pb-2.5 pt-4 text-[11px] font-medium text-muted sm:px-6"
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-5 py-3 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        {record.donation ? (
                          <CategoryIcon category={record.donation.category} />
                        ) : (
                          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-muted">
                            <PackageCheck
                              className="size-[17px]"
                              strokeWidth={1.7}
                            />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-ink">
                            {record.donation?.title ?? "Donation removed"}
                          </span>
                          <span className="mt-0.5 block text-[10.5px] text-muted">
                            {record.donation
                              ? CATEGORY_LABELS[record.donation.category]
                              : "No longer listed"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="tabular text-[12.5px] text-secondary">
                        {formatQuantity(
                          record.collectedQuantity,
                          record.quantityUnit,
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-secondary">
                        {formatDateTime(record.collectedAt)}
                      </span>
                    </td>
                    <td className="max-w-[280px] px-5 py-3 text-[11.5px] leading-5 text-muted sm:px-6">
                      {record.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line md:hidden">
            {records.map((record) => (
              <li key={record.id} className="p-4">
                <div className="flex items-start gap-3">
                  {record.donation ? (
                    <CategoryIcon category={record.donation.category} />
                  ) : (
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-muted">
                      <PackageCheck
                        className="size-[17px]"
                        strokeWidth={1.7}
                      />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {record.donation?.title ?? "Donation removed"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {formatQuantity(
                        record.collectedQuantity,
                        record.quantityUnit,
                      )}{" "}
                      · {formatDateTime(record.collectedAt)}
                    </p>
                    {record.notes && (
                      <p className="mt-1.5 text-[11px] leading-5 text-muted">
                        {record.notes}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
