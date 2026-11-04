import Link from "next/link";
import { Plus, Search, UtensilsCrossed } from "lucide-react";
import type { DonationStatus } from "@/types";
import { requireDonor } from "@/lib/auth";
import { getDonorRepository } from "@/lib/data";
import { DONATION_STATUS_FILTERS } from "@/lib/constants";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { DonationsTable } from "@/components/dashboard/donations-table";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "My donations",
};

type SearchParams = Promise<{ status?: string; q?: string }>;

function parseStatus(value: string | undefined): DonationStatus | "all" {
  if (
    value === "available" ||
    value === "assigned" ||
    value === "collected" ||
    value === "expired" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "all";
}

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const profile = await requireDonor();
  const params = await searchParams;
  const status = parseStatus(params.status);
  const query = params.q?.trim() ?? "";
  const donations = await getDonorRepository().listDonations(profile.id, {
    status,
    q: query,
  });

  const filtersActive = status !== "all" || query.length > 0;
  const activeFilter =
    DONATION_STATUS_FILTERS.find((filter) => filter.value === status)?.label ??
    "All";

  function filterHref(value: DonationStatus | "all") {
    const search = new URLSearchParams();
    if (value !== "all") search.set("status", value);
    if (query) search.set("q", query);
    const suffix = search.toString();
    return `/donor/donations${suffix ? `?${suffix}` : ""}`;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="My donations"
        description="Every surplus food listing you have published, from first share to final collection."
        actions={
          <Link href="/donor/donations/new" className={buttonStyles()}>
            <Plus className="size-4" strokeWidth={2} />
            New donation
          </Link>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="scrollbar-none flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-control border border-line bg-paper p-1"
          role="tablist"
          aria-label="Filter donations by status"
        >
          {DONATION_STATUS_FILTERS.map((filter) => {
            const active = filter.value === status;

            return (
              <Link
                key={filter.value}
                href={filterHref(filter.value)}
                role="tab"
                aria-selected={active}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center rounded-xs px-3 text-[12.5px] transition-colors",
                  active
                    ? "bg-green-light font-medium text-green-dark"
                    : "text-secondary hover:bg-surface hover:text-ink",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <form
          action="/donor/donations"
          method="get"
          role="search"
          className="relative w-full lg:max-w-xs"
        >
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            strokeWidth={1.8}
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by food title"
            aria-label="Search donations by food title"
            className="h-10 w-full rounded-control border border-line bg-paper pl-9 pr-10 text-[13px] text-ink placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/15 [&::-webkit-search-cancel-button]:appearance-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-xs text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <Search className="size-3.5" strokeWidth={2} />
          </button>
        </form>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">
              {donations.length}{" "}
              {donations.length === 1 ? "donation" : "donations"}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {filtersActive
                ? `Filtered by ${activeFilter.toLowerCase()}${
                    query ? ` and “${query}”` : ""
                  }.`
                : "Sorted by newest first."}
            </p>
          </div>
          {filtersActive && (
            <Link
              href="/donor/donations"
              className="text-[11.5px] font-medium text-green-dark transition-colors hover:text-green-text"
            >
              Clear filters
            </Link>
          )}
        </div>

        {donations.length > 0 ? (
          <DonationsTable donations={donations} />
        ) : (
          <EmptyState
            icon={UtensilsCrossed}
            title={
              filtersActive ? "No donations match these filters" : "No donations yet"
            }
            description={
              filtersActive
                ? "Try a different status or search term to find the listing you need."
                : "Publish your first surplus food listing and nearby NGOs can request a collection."
            }
            action={
              filtersActive ? (
                <Link
                  href="/donor/donations"
                  className={buttonStyles({ variant: "secondary" })}
                >
                  Clear filters
                </Link>
              ) : (
                <Link href="/donor/donations/new" className={buttonStyles()}>
                  <Plus className="size-4" strokeWidth={2} />
                  Create donation
                </Link>
              )
            }
          />
        )}
      </Card>
    </div>
  );
}
