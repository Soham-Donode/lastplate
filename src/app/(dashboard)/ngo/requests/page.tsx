import Link from "next/link";
import { Compass, Inbox, UtensilsCrossed } from "lucide-react";
import type { CollectionRequestStatus } from "@/types";
import { requireNgo } from "@/lib/auth";
import { getNgoRepository } from "@/lib/data";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { RequestStatusBadge } from "@/components/dashboard/status-badge";
import { CancelRequestButton } from "@/components/requests/cancel-request-button";
import {
  cn,
  formatDateTime,
  formatQuantity,
  formatRelative,
} from "@/lib/utils";

export const metadata = {
  title: "My requests",
};

type RequestFilter = CollectionRequestStatus | "all";

const FILTERS: { value: RequestFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

function parseFilter(value: string | undefined): RequestFilter {
  return FILTERS.some((filter) => filter.value === value)
    ? (value as RequestFilter)
    : "all";
}

export default async function NgoRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const profile = await requireNgo();
  const params = await searchParams;
  const filter = parseFilter(params.status);
  const requests = await getNgoRepository().listRequests(profile.id);
  const filtered =
    filter === "all"
      ? requests
      : requests.filter((request) => request.status === filter);

  return (
    <div className="space-y-5">
      <PageHeader
        title="My requests"
        description="Track the collection requests your organization has sent. You can cancel a request while it is still pending."
        actions={
          <Link href="/ngo/explore" className={buttonStyles()}>
            <Compass className="size-4" strokeWidth={1.8} />
            Explore donations
          </Link>
        }
      />

      <div
        className="scrollbar-none flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-control border border-line bg-surface p-1"
        role="tablist"
        aria-label="Filter requests by status"
      >
        {FILTERS.map((item) => {
          const active = item.value === filter;
          const count =
            item.value === "all"
              ? requests.length
              : requests.filter((request) => request.status === item.value)
                  .length;

          return (
            <Link
              key={item.value}
              href={
                item.value === "all"
                  ? "/ngo/requests"
                  : `/ngo/requests?status=${item.value}`
              }
              role="tab"
              aria-selected={active}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xs px-3 text-[12.5px] transition-colors",
                active
                  ? "bg-accent-soft font-medium text-accent-strong"
                  : "text-secondary hover:bg-surface hover:text-ink",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "tabular text-[10.5px]",
                  active ? "text-accent-ink" : "text-muted",
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-5 sm:p-6">
          <EmptyState
            icon={Inbox}
            title={
              filter === "all"
                ? "No collection requests yet"
                : `No ${filter} requests`
            }
            description={
              filter === "all"
                ? "Browse available donations and send a request to a donor. Your requests will appear here."
                : "There are no requests with this status right now."
            }
            action={
              <Link href="/ngo/explore" className={buttonStyles()}>
                <Compass className="size-4" strokeWidth={1.8} />
                Explore donations
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => (
            <Card key={request.id} className="p-5">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-line/60 bg-surface text-muted"
                >
                  <UtensilsCrossed className="size-[17px]" strokeWidth={1.7} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      {request.donation ? (
                        <Link
                          href={`/ngo/donations/${request.donation.id}`}
                          className="truncate text-[13.5px] font-medium text-ink transition-colors hover:text-accent-strong"
                        >
                          {request.donation.title}
                        </Link>
                      ) : (
                        <p className="truncate text-[13.5px] font-medium text-muted">
                          Removed donation
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-muted">
                        Sent {formatRelative(request.createdAt)}
                      </p>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
                    <span className="text-muted">Requested</span>
                    <span className="tabular font-medium text-ink">
                      {request.donation
                        ? formatQuantity(
                            request.requestedQuantity,
                            request.donation.quantityUnit,
                          )
                        : formatQuantity(request.requestedQuantity)}
                    </span>
                    {request.donation && (
                      <>
                        <span aria-hidden="true" className="text-line-strong">
                          ·
                        </span>
                        <span className="text-muted">
                          Pickup by{" "}
                          {formatDateTime(request.donation.pickupDeadline)}
                        </span>
                      </>
                    )}
                  </div>

                  {request.message && (
                    <p className="mt-3 border-l-2 border-line pl-3 text-[12px] leading-5 text-secondary">
                      “{request.message}”
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {request.donation && (
                      <Link
                        href={`/ngo/donations/${request.donation.id}`}
                        className={buttonStyles({
                          variant: "secondary",
                          size: "sm",
                        })}
                      >
                        View donation
                      </Link>
                    )}
                    {request.status === "pending" && (
                      <CancelRequestButton requestId={request.id} />
                    )}
                    {request.status === "accepted" && request.donation && (
                      <Link
                        href={`/ngo/donations/${request.donation.id}`}
                        className={buttonStyles({ size: "sm" })}
                      >
                        Confirm collection
                      </Link>
                    )}
                    {request.status === "completed" && (
                      <Link
                        href="/ngo/collections"
                        className={buttonStyles({
                          variant: "secondary",
                          size: "sm",
                        })}
                      >
                        View collections
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
