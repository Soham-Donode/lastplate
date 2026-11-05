import Link from "next/link";
import { Inbox, UtensilsCrossed } from "lucide-react";
import type { CollectionRequestStatus } from "@/types";
import { requireDonor } from "@/lib/auth";
import { getDonorRepository } from "@/lib/data";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { RequestStatusBadge } from "@/components/dashboard/status-badge";
import { RequestActions } from "@/components/requests/request-actions";
import {
  cn,
  formatDateTime,
  formatQuantity,
  formatRelative,
} from "@/lib/utils";

export const metadata = {
  title: "Collection requests",
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

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const profile = await requireDonor();
  const params = await searchParams;
  const filter = parseFilter(params.status);
  const requests = await getDonorRepository().listRequests(profile.id);
  const filtered =
    filter === "all"
      ? requests
      : requests.filter((request) => request.status === filter);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Collection requests"
        description="Review requests from verified NGOs. Accepting a request assigns the donation and closes the remaining pending requests for it."
        actions={
          <Link
            href="/donor/donations"
            className={buttonStyles({ variant: "secondary" })}
          >
            <UtensilsCrossed className="size-4" strokeWidth={1.8} />
            View donations
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
                  ? "/donor/requests"
                  : `/donor/requests?status=${item.value}`
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
                ? "When an NGO requests one of your available donations, it will appear here for review."
                : "There are no requests with this status right now."
            }
            action={
              <Link
                href="/donor/donations/new"
                className={buttonStyles({ variant: "secondary" })}
              >
                Publish a donation
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => (
            <Card key={request.id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar
                  name={request.ngo?.organizationName ?? "NGO"}
                  size="md"
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink">
                        {request.ngo?.organizationName ?? "NGO"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {request.ngo?.city ?? "—"} · Requested{" "}
                        {formatRelative(request.createdAt)}
                      </p>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
                    <span className="text-muted">For</span>
                    {request.donation ? (
                      <Link
                        href={`/donor/donations/${request.donation.id}`}
                        className="font-medium text-ink transition-colors hover:text-accent-strong"
                      >
                        {request.donation.title}
                      </Link>
                    ) : (
                      <span className="font-medium text-muted">
                        Removed donation
                      </span>
                    )}
                    <span aria-hidden="true" className="text-line-strong">
                      ·
                    </span>
                    <span className="tabular text-secondary">
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

                  {request.status === "pending" && (
                    <RequestActions requestId={request.id} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
