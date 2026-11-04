import Link from "next/link";
import { Inbox } from "lucide-react";
import type { CollectionRequest } from "@/types";
import { formatQuantity, formatRelative } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { RequestStatusBadge } from "./status-badge";

export function RecentNgoRequestList({
  requests,
}: {
  requests: CollectionRequest[];
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No requests yet"
        description="Find an available donation and send your first collection request."
        className="py-8"
      />
    );
  }

  return (
    <ul className="-my-2 divide-y divide-line">
      {requests.map((request) => (
        <li key={request.id}>
          <Link
            href={`/ngo/donations/${request.donationId}`}
            className="group -mx-2 flex items-start gap-3 rounded-control px-2 py-3 transition-colors hover:bg-canvas"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="truncate text-[12.5px] font-medium text-ink group-hover:text-green-dark">
                  {request.donation?.title ?? "Donation removed"}
                </span>
                <RequestStatusBadge
                  status={request.status}
                  className="shrink-0"
                />
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                {request.donation
                  ? `Requested ${formatQuantity(
                      request.requestedQuantity,
                      request.donation.quantityUnit,
                    )}`
                  : "This listing is no longer available"}
              </span>
              <span className="mt-1 block text-[10.5px] text-muted/90">
                Sent {formatRelative(request.createdAt)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
