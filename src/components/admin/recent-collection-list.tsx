import { PackageCheck } from "lucide-react";
import type { CollectionRecord } from "@/types";
import { formatQuantity, formatRelative } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export function RecentCollectionList({
  collections,
}: {
  collections: CollectionRecord[];
}) {
  if (collections.length === 0) {
    return (
      <EmptyState
        icon={PackageCheck}
        title="No collections yet"
        description="Completed pickups will appear here as donors and NGOs finish collections."
      />
    );
  }

  return (
    <ul className="divide-y divide-line">
      {collections.map((record) => (
        <li key={record.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-green-light text-green-dark"
          >
            <PackageCheck className="size-4" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-ink">
              {record.donation?.title ?? "Collected donation"}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted">
              {record.ngo?.organizationName ?? "NGO"} ·{" "}
              {formatQuantity(record.collectedQuantity, record.quantityUnit)}
            </p>
          </div>
          <span className="shrink-0 text-[10.5px] text-muted">
            {formatRelative(record.collectedAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
