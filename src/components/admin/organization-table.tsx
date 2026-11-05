import { Building2, Handshake, Mail } from "lucide-react";
import type { AdminOrganization, VerificationStatus } from "@/types";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Badge, StatusDot } from "@/components/ui/badge";
import { AccountStatusControl } from "@/components/admin/account-status-control";
import { VerificationActions } from "@/components/admin/verification-actions";

function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified") {
    return (
      <Badge tone="accent">
        <StatusDot tone="accent" />
        Verified
      </Badge>
    );
  }

  if (status === "rejected") {
    return <Badge tone="neutral">Rejected</Badge>;
  }

  return (
    <Badge tone="outline">
      <StatusDot tone="dark" />
      Pending
    </Badge>
  );
}

function AccountBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge tone="accent">
      <StatusDot tone="accent" />
      Active
    </Badge>
  ) : (
    <Badge tone="neutral">Disabled</Badge>
  );
}

function OrganizationIdentity({
  organization,
}: {
  organization: AdminOrganization;
}) {
  const { profile } = organization;

  return (
    <div className="flex min-w-0 items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-line/60 bg-surface text-muted"
      >
        <Building2 className="size-[17px]" strokeWidth={1.7} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-ink">
          {profile.organizationName}
        </span>
        <span className="mt-0.5 block truncate text-[10.5px] text-muted">
          {profile.organizationType} · {profile.city}
        </span>
        <span className="mt-1 flex items-center gap-1 truncate text-[10.5px] text-muted">
          <Mail className="size-3 shrink-0" strokeWidth={1.8} />
          {profile.email}
        </span>
        {profile.role === "ngo" && profile.registrationNumber && (
          <span
            className="mt-0.5 block truncate text-[10.5px] text-muted"
            title={profile.verificationNotes ?? undefined}
          >
            Reg. {profile.registrationNumber}
          </span>
        )}
      </span>
    </div>
  );
}

function ActivitySummary({
  organization,
}: {
  organization: AdminOrganization;
}) {
  return (
    <div className="text-[11.5px] leading-5 text-secondary">
      <p>
        <span className="tabular font-medium text-ink">
          {organization.donationsPublished}
        </span>{" "}
        {organization.donationsPublished === 1 ? "donation" : "donations"}
      </p>
      <p className="flex items-center gap-1 text-muted">
        <Handshake className="size-3" strokeWidth={1.8} />
        {organization.collectionsCompleted}{" "}
        {organization.collectionsCompleted === 1
          ? "collection"
          : "collections"}
      </p>
    </div>
  );
}

function OrganizationActions({
  organization,
}: {
  organization: AdminOrganization;
}) {
  const { profile } = organization;

  return (
    <div className="flex flex-col items-start gap-2">
      {profile.role === "ngo" && (
        <VerificationActions
          ngoId={profile.id}
          status={profile.verificationStatus}
          organizationName={profile.organizationName}
        />
      )}
      <AccountStatusControl
        profileId={profile.id}
        isActive={profile.isActive}
        organizationName={profile.organizationName}
      />
    </div>
  );
}

export function OrganizationTable({
  organizations,
}: {
  organizations: AdminOrganization[];
}) {
  return (
    <>
      <div className="hidden lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Organization
              </th>
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Role
              </th>
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Verification
              </th>
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Activity
              </th>
              <th scope="col" className="pb-2.5 pr-4 text-[11px] font-medium text-muted">
                Account
              </th>
              <th scope="col" className="pb-2.5 text-[11px] font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {organizations.map((organization) => {
              const { profile } = organization;

              return (
                <tr key={profile.id} className="align-top">
                  <td className="py-4 pr-4">
                    <OrganizationIdentity organization={organization} />
                  </td>
                  <td className="py-4 pr-4">
                    <Badge tone={profile.role === "ngo" ? "outline" : "neutral"}>
                      {ROLE_LABELS[profile.role]}
                    </Badge>
                  </td>
                  <td className="py-4 pr-4">
                    {profile.role === "ngo" ? (
                      <VerificationBadge status={profile.verificationStatus} />
                    ) : (
                      <span className="text-[11.5px] text-muted">Not required</span>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <ActivitySummary organization={organization} />
                    <p className="mt-1 text-[10.5px] text-muted">
                      Joined {formatDate(profile.createdAt)}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <AccountBadge active={profile.isActive} />
                  </td>
                  <td className="py-4">
                    <OrganizationActions organization={organization} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line lg:hidden">
        {organizations.map((organization) => {
          const { profile } = organization;

          return (
            <li key={profile.id} className="py-4">
              <div className="flex items-start justify-between gap-3">
                <OrganizationIdentity organization={organization} />
                <AccountBadge active={profile.isActive} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone={profile.role === "ngo" ? "outline" : "neutral"}>
                  {ROLE_LABELS[profile.role]}
                </Badge>
                {profile.role === "ngo" ? (
                  <VerificationBadge status={profile.verificationStatus} />
                ) : (
                  <span className="text-[11px] text-muted">
                    Donor verification not required
                  </span>
                )}
              </div>

              <div className="mt-3">
                <ActivitySummary organization={organization} />
              </div>

              <div className="mt-3 border-t border-line pt-3">
                <OrganizationActions organization={organization} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
