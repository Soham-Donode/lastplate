import Link from "next/link";
import {
  ArrowUpRight,
  CheckCheck,
  Compass,
  Inbox,
  MapPin,
  PackageCheck,
} from "lucide-react";
import { requireNgo } from "@/lib/auth";
import { getNgoRepository } from "@/lib/data";
import { buttonStyles } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeadlineList } from "@/components/dashboard/deadline-list";
import { NearbyDonationList } from "@/components/dashboard/nearby-donation-list";
import { RecentNgoRequestList } from "@/components/dashboard/recent-ngo-request-list";
import { RequestSummary } from "@/components/dashboard/request-summary";
import { DonationMap } from "@/components/map/donation-map";

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

export default async function NgoDashboardPage() {
  const profile = await requireNgo();
  const overview = await getNgoRepository().getNgoOverview(profile.id);
  const firstName = profile.fullName.split(" ")[0] ?? profile.fullName;

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here is what is available for ${profile.organizationName} today.`}
        actions={
          <>
            <Link href="/ngo/explore" className={buttonStyles()}>
              <Compass className="size-4" strokeWidth={1.8} />
              Explore donations
            </Link>
            <Link
              href="/ngo/requests"
              className={buttonStyles({ variant: "secondary" })}
            >
              <Inbox className="size-4" strokeWidth={1.8} />
              My requests
              {overview.pendingRequests > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-soft px-1.5 text-[10.5px] font-medium text-accent-strong tabular">
                  {overview.pendingRequests}
                </span>
              )}
            </Link>
          </>
        }
      />

      <Panel
        title="Donations near your kitchen"
        description={`Available pickups within 10 km of ${profile.organizationName}. Select a marker to open the donation.`}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-[10.5px] font-medium text-accent-strong">
            <MapPin className="size-3" strokeWidth={2} />
            10 km radius
          </span>
        }
        className="overflow-hidden"
        bodyClassName="p-0"
      >
        <div className="border-t border-line">
          <DonationMap
            donations={overview.mapDonations}
            latitude={profile.latitude}
            longitude={profile.longitude}
            city={profile.city}
            radiusKm={10}
            hrefBase="/ngo/donations"
            className="h-[360px] w-full sm:h-[440px]"
          />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Panel
            title="Available near you"
            description="Surplus food published by nearby donors"
            action={
              <PanelLink
                href="/ngo/explore"
                label="Explore all available donations"
              />
            }
          >
            <NearbyDonationList donations={overview.nearbyDonations} />
          </Panel>

          <Panel
            title="Your recent requests"
            description="The latest requests your organization has sent"
            action={
              <PanelLink href="/ngo/requests" label="View all requests" />
            }
          >
            <RecentNgoRequestList requests={overview.recentRequests} />
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <Panel
            title="Upcoming pickups"
            description="Donations assigned to your organization"
            action={
              <PanelLink
                href="/ngo/requests?status=accepted"
                label="View accepted requests"
              />
            }
          >
            <DeadlineList
              donations={overview.upcomingPickups}
              hrefBase="/ngo/donations"
              emptyTitle="No pickups scheduled"
              emptyDescription="Accepted collection requests will appear here with their pickup deadline."
            />
          </Panel>

          <Panel
            title="Collection summary"
            description="How your requests have progressed"
            action={
              <PanelLink href="/ngo/collections" label="View collections" />
            }
          >
            <RequestSummary counts={overview.requestCounts} />
          </Panel>
        </div>
      </div>

      {overview.acceptedRequests > 0 && (
        <div className="flex items-start gap-3 rounded-card border border-accent/15 bg-accent-soft px-4 py-3">
          <CheckCheck
            className="mt-0.5 size-4 shrink-0 text-accent-strong"
            strokeWidth={1.8}
          />
          <p className="text-[11.5px] leading-5 text-accent-strong">
            You have {overview.acceptedRequests}{" "}
            {overview.acceptedRequests === 1 ? "pickup" : "pickups"} waiting.
            Confirm collection after your team has collected the food.
          </p>
          <Link
            href="/ngo/requests?status=accepted"
            className="ml-auto hidden shrink-0 items-center gap-1 text-[11.5px] font-medium text-accent-strong hover:underline sm:inline-flex"
          >
            <PackageCheck className="size-3.5" strokeWidth={1.8} />
            Review
          </Link>
        </div>
      )}
    </div>
  );
}
