import Link from "next/link";
import { ArrowUpRight, Inbox, Plus, UtensilsCrossed } from "lucide-react";
import { requireDonor } from "@/lib/auth";
import { getDonorRepository } from "@/lib/data";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeadlineList } from "@/components/dashboard/deadline-list";
import { RecentRequestList } from "@/components/dashboard/recent-request-list";
import { DonationsTable } from "@/components/dashboard/donations-table";
import { CollectionSummary } from "@/components/dashboard/collection-summary";

export const metadata = {
  title: "Overview",
};

function PanelLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-full border border-line text-secondary transition-colors hover:bg-surface hover:text-ink"
    >
      <ArrowUpRight className="size-[15px]" strokeWidth={1.8} />
    </Link>
  );
}

export default async function DonorDashboardPage() {
  const profile = await requireDonor();
  const overview = await getDonorRepository().getDonorOverview(profile.id);
  const firstName = profile.fullName.split(" ")[0] ?? profile.fullName;

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here is what is happening at ${profile.organizationName} today.`}
        actions={
          <>
            <Link href="/donor/donations/new" className={buttonStyles()}>
              <Plus className="size-4" strokeWidth={2} />
              New donation
            </Link>
            <Link
              href="/donor/requests"
              className={buttonStyles({ variant: "secondary" })}
            >
              <Inbox className="size-4" strokeWidth={1.8} />
              Review requests
              {overview.pendingRequests > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-soft px-1.5 text-[10.5px] font-medium text-accent-strong tabular">
                  {overview.pendingRequests}
                </span>
              )}
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Panel
            title="Pickup deadlines"
            description="Your next scheduled collections"
            action={
              <PanelLink
                href="/donor/donations"
                label="View donation deadlines"
              />
            }
          >
            <DeadlineList donations={overview.upcomingDeadlines} />
          </Panel>

          <Panel
            title="Recent donations"
            description="Your latest published listings"
            action={
              <PanelLink href="/donor/donations" label="View all donations" />
            }
          >
            {overview.recentDonations.length > 0 ? (
              <DonationsTable donations={overview.recentDonations} />
            ) : (
              <EmptyState
                icon={UtensilsCrossed}
                title="No donations yet"
                description="Publish your first surplus food listing and nearby NGOs can request a collection."
                action={
                  <Link href="/donor/donations/new" className={buttonStyles()}>
                    <Plus className="size-4" strokeWidth={2} />
                    Create donation
                  </Link>
                }
              />
            )}
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <Panel
            title="Collection requests"
            description="Latest requests from partner NGOs"
            action={
              <PanelLink href="/donor/requests" label="View all requests" />
            }
          >
            <RecentRequestList requests={overview.recentRequests} />
          </Panel>

          <Panel
            title="Collection summary"
            description="How your published listings have performed"
            action={
              <PanelLink
                href="/donor/history"
                label="View collection history"
              />
            }
          >
            <CollectionSummary counts={overview.statusCounts} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
