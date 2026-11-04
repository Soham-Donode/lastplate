import Link from "next/link";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import type { VerificationStatus } from "@/types";
import { requireAdmin } from "@/lib/auth";
import { getAdminRepository } from "@/lib/data";
import type {
  AccountStateFilter,
  OrganizationRoleFilter,
} from "@/lib/data/types";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/page-header";
import { OrganizationTable } from "@/components/admin/organization-table";

export const metadata = {
  title: "Organizations",
};

type UsersParams = {
  q?: string;
  role?: string;
  verification?: string;
  state?: string;
};

function parseRole(value: string | undefined): OrganizationRoleFilter {
  return value === "donor" || value === "ngo" ? value : "all";
}

function parseVerification(value: string | undefined): VerificationStatus | "all" {
  return value === "pending" || value === "verified" || value === "rejected"
    ? value
    : "all";
}

function parseState(value: string | undefined): AccountStateFilter {
  return value === "active" || value === "disabled" ? value : "all";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<UsersParams>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const role = parseRole(params.role);
  const verification = parseVerification(params.verification);
  const state = parseState(params.state);

  const organizations = await getAdminRepository().listOrganizations({
    q,
    role,
    verification,
    state,
  });

  const filtersActive =
    Boolean(q) || role !== "all" || verification !== "all" || state !== "all";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Organizations"
        description="Every donor and NGO registered on LastPlate. Verify NGOs and disable accounts that should no longer take part."
        actions={
          <Link
            href="/admin/donations"
            className={buttonStyles({ variant: "secondary" })}
          >
            View donations
          </Link>
        }
      />

      <Card className="p-4 sm:p-5">
        <form
          action="/admin/users"
          method="get"
          role="search"
          className="space-y-3"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field
              label="Search organizations"
              htmlFor="q"
              className="min-w-0 flex-1"
            >
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.8}
                />
                <Input
                  id="q"
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Name, email, or city"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Role" htmlFor="role" className="sm:w-40">
              <Select id="role" name="role" defaultValue={role}>
                <option value="all">All roles</option>
                <option value="donor">Food donors</option>
                <option value="ngo">NGOs</option>
              </Select>
            </Field>

            <Field
              label="Verification"
              htmlFor="verification"
              className="sm:w-44"
            >
              <Select
                id="verification"
                name="verification"
                defaultValue={verification}
              >
                <option value="all">Any status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </Select>
            </Field>

            <Field label="Account" htmlFor="state" className="sm:w-40">
              <Select id="state" name="state" defaultValue={state}>
                <option value="all">Any account</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </Select>
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className={buttonStyles()}>
              <SlidersHorizontal className="size-4" strokeWidth={1.8} />
              Apply filters
            </button>
            {filtersActive && (
              <Link
                href="/admin/users"
                className={buttonStyles({ variant: "ghost" })}
              >
                Clear
              </Link>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">
              {organizations.length}{" "}
              {organizations.length === 1 ? "organization" : "organizations"}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {filtersActive
                ? "Filtered organizations, with pending NGOs shown first."
                : "Sorted with NGOs awaiting verification first."}
            </p>
          </div>
          <Link
            href="/admin/users?verification=pending"
            className="text-[11.5px] font-medium text-green-dark transition-colors hover:text-green-text"
          >
            Review pending NGOs
          </Link>
        </div>

        {organizations.length > 0 ? (
          <OrganizationTable organizations={organizations} />
        ) : (
          <EmptyState
            icon={Users}
            title="No organizations match these filters"
            description="Try a different role, verification status, account state, or search term."
            action={
              <Link
                href="/admin/users"
                className={buttonStyles({ variant: "secondary" })}
              >
                Clear filters
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}
