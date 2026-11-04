import { ShieldCheck } from "lucide-react";
import type { Profile } from "@/types";
import { formatRelative } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { VerificationActions } from "@/components/admin/verification-actions";

export function PendingVerificationList({ ngos }: { ngos: Profile[] }) {
  if (ngos.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No NGOs waiting"
        description="New NGO registrations appear here for review before they can request collections."
      />
    );
  }

  return (
    <ul className="divide-y divide-line">
      {ngos.map((ngo) => (
        <li
          key={ngo.id}
          className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[13px] font-medium text-ink">
                {ngo.organizationName}
              </p>
              <Badge tone="outline">Pending</Badge>
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {ngo.organizationType} · {ngo.city}
            </p>
            <p className="mt-1 text-[11px] text-muted">
              {ngo.fullName} · Registered {formatRelative(ngo.createdAt)}
            </p>
            {ngo.registrationNumber && (
              <p className="mt-0.5 text-[11px] text-muted">
                Reg. {ngo.registrationNumber}
              </p>
            )}
            {ngo.verificationNotes && (
              <p className="mt-1 max-w-md text-[11px] leading-4 text-secondary">
                {ngo.verificationNotes}
              </p>
            )}
          </div>

          <div className="shrink-0">
            <VerificationActions
              ngoId={ngo.id}
              status={ngo.verificationStatus}
              organizationName={ngo.organizationName}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
