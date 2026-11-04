import type { ReactNode } from "react";
import { requireProfile } from "@/lib/auth";
import {
  getAdminRepository,
  getDonorRepository,
  getNgoRepository,
  isDemoMode,
} from "@/lib/data";
import { DashboardShell } from "@/components/layout/dashboard-shell";

// Dashboard data is per-session and mutable, so never prerender it at build
// time. In demo mode the file-backed workspace also needs a live read.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireProfile();
  const pendingRequests =
    profile.role === "ngo"
      ? await getNgoRepository().getPendingRequestCount(profile.id)
      : profile.role === "donor"
        ? await getDonorRepository().getPendingRequestCount(profile.id)
        : await getAdminRepository().getPendingVerificationCount();

  return (
    <DashboardShell
      profile={profile}
      pendingRequests={pendingRequests}
      demo={isDemoMode}
    >
      {children}
    </DashboardShell>
  );
}
