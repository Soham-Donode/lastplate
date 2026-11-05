import { ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { isDemoMode } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/constants";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata = {
  title: "Admin settings",
};

export default async function AdminSettingsPage() {
  const profile = await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PageHeader
        title="Settings"
        description="Your administrator account and the safeguards that apply to platform administration."
      />

      <Card className="p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold text-ink">Administrator account</h2>
        <p className="mt-1 text-[12px] leading-5 text-muted">
          Administrator accounts are provisioned manually. They cannot be
          created through public registration or disabled from this workspace.
        </p>

        <dl className="mt-4 divide-y divide-line">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[11.5px] text-muted">Name</dt>
            <dd className="text-right text-[12px] font-medium text-ink">
              {profile.fullName}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[11.5px] text-muted">Email</dt>
            <dd className="text-right text-[12px] font-medium text-ink">
              {profile.email}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[11.5px] text-muted">Role</dt>
            <dd>
              <Badge tone="dark">{ROLE_LABELS[profile.role]}</Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[11.5px] text-muted">Account status</dt>
            <dd>
              <Badge tone={profile.isActive ? "accent" : "neutral"}>
                <StatusDot tone={profile.isActive ? "accent" : "neutral"} />
                {profile.isActive ? "Active" : "Disabled"}
              </Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[11.5px] text-muted">Organization</dt>
            <dd className="text-right text-[12px] font-medium text-ink">
              {profile.organizationName}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <ShieldCheck className="size-4 text-accent-ink" strokeWidth={1.8} />
          Administration safeguards
        </h2>
        <ul className="mt-3 space-y-2.5 text-[12px] leading-5 text-secondary">
          <li>
            Verification and account-state changes are validated on the server
            and restricted to active administrators.
          </li>
          <li>
            Rejecting an NGO or disabling an account closes its pending
            collection requests so donors are not left with unactionable
            requests.
          </li>
          <li>
            Disabling a donor also cancels its still-available listings.
            Assigned pickups remain visible so an NGO can finish the collection.
          </li>
          <li>
            LastPlate coordinates food donation. It does not certify food safety,
            and administrators cannot mark food as safe.
          </li>
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-[11px] leading-4 text-muted">
          {isDemoMode
            ? "Demo workspace — verification and account changes are stored locally in .data."
            : "Changes apply immediately across the platform."}
        </p>
      </Card>
    </div>
  );
}
