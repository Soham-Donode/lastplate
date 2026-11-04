import Link from "next/link";
import {
  ArrowUpRight,
  PackageCheck,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminRepository } from "@/lib/data";
import { buttonStyles } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminDonationsTable } from "@/components/admin/admin-donations-table";
import { PendingVerificationList } from "@/components/admin/pending-verification-list";
import { RecentCollectionList } from "@/components/admin/recent-collection-list";

export const metadata = {
  title: "Admin overview",
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

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();
  const overview = await getAdminRepository().getAdminOverview();
  const firstName = profile.fullName.split(" ")[0] ?? profile.fullName;

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Platform overview"
        description={`Welcome back, ${firstName}. Review verification requests and keep an eye on donation activity across LastPlate.`}
        actions={
          <>
            <Link
              href="/admin/users?verification=pending"
              className={buttonStyles()}
            >
              <ShieldCheck className="size-4" strokeWidth={1.8} />
              Review NGOs
              {overview.pendingVerification > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[10.5px] font-medium tabular">
                  {overview.pendingVerification}
                </span>
              )}
            </Link>
            <Link
              href="/admin/donations"
              className={buttonStyles({ variant: "secondary" })}
            >
              <UtensilsCrossed className="size-4" strokeWidth={1.8} />
              All donations
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Panel
            title="NGO verification queue"
            description="Review new NGOs before they can request collections"
            action={
              <PanelLink
                href="/admin/users?verification=pending"
                label="View all NGOs awaiting verification"
              />
            }
          >
            <PendingVerificationList ngos={overview.pendingNgos} />
          </Panel>

          <Panel
            title="Recent donations"
            description="The latest listings across the platform"
            action={
              <PanelLink
                href="/admin/donations"
                label="View all donations"
              />
            }
          >
            <AdminDonationsTable donations={overview.recentDonations} />
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <Panel
            title="Recent collections"
            description="Food rescued by partner NGOs"
            action={
              <PanelLink
                href="/admin/donations?status=collected"
                label="View completed collections"
              />
            }
          >
            <RecentCollectionList collections={overview.recentCollections} />
          </Panel>

          <Panel
            title="Account health"
            description="Access status across all organizations"
          >
            <ul className="divide-y divide-line">
              <li className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <span className="text-[12px] text-secondary">Active accounts</span>
                <span className="tabular text-[12.5px] font-medium text-ink">
                  {overview.activeAccounts}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3 py-3">
                <span className="text-[12px] text-secondary">
                  Disabled accounts
                </span>
                <span className="tabular text-[12.5px] font-medium text-ink">
                  {overview.disabledAccounts}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3 py-3 last:pb-0">
                <span className="flex items-center gap-2 text-[12px] text-secondary">
                  <PackageCheck className="size-3.5 text-muted" strokeWidth={1.8} />
                  Completed collections
                </span>
                <span className="tabular text-[12.5px] font-medium text-ink">
                  {overview.completedCollections}
                </span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
