import Link from "next/link";
import { Inbox } from "lucide-react";
import type { CollectionRequest } from "@/types";
import { formatQuantity, formatRelative } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { RequestStatusBadge } from "./status-badge";

export function RecentRequestList({
  requests,
}: {
  requests: CollectionRequest[];
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No collection requests yet"
        description="When an NGO requests one of your listings, it will show up here for review."
        className="py-8"
      />
    );
  }

  return (
    <ul className="-my-2 divide-y divide-line">
      {requests.map((request) => (
        <li key={request.id}>
          <Link
            href="/donor/requests"
            className="group -mx-2 flex items-start gap-3 rounded-control px-2 py-3 transition-colors hover:bg-canvas"
          >
            <Avatar
              name={request.ngo?.organizationName ?? "NGO"}
              size="sm"
              className="mt-0.5"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="truncate text-[12.5px] font-medium text-ink group-hover:text-green-dark">
                  {request.ngo?.organizationName ?? "NGO"}
                </span>
                <RequestStatusBadge
                  status={request.status}
                  className="shrink-0"
                />
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                {request.donation?.title ?? "Donation removed"}
                {request.donation
                  ? ` · ${formatQuantity(
                      request.requestedQuantity,
                      request.donation.quantityUnit,
                    )}`
                  : ""}
              </span>
              <span className="mt-1 block text-[10.5px] text-muted/90">
                Requested {formatRelative(request.createdAt)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
