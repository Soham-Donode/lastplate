import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Profile } from "@/types";
import { ROLE_HOME } from "@/lib/constants";
import { getDonorRepository, isDemoMode } from "@/lib/data";
import { DEMO_ADMIN_ID, DEMO_DONOR_ID, DEMO_NGO_ID } from "@/lib/demo/seed";
import {
  DEMO_ROLE_COOKIE,
  parseDemoRole,
} from "@/lib/demo/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Resolves the signed-in profile once per request. In demo mode the seeded
 * donor or NGO profile is returned so both sides of the workflow can be
 * explored without setup.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const repository = getDonorRepository();

  if (isDemoMode) {
    const cookieStore = await cookies();
    const role = parseDemoRole(cookieStore.get(DEMO_ROLE_COOKIE)?.value);
    const profile = await repository.getProfile(
      role === "ngo"
        ? DEMO_NGO_ID
        : role === "admin"
          ? DEMO_ADMIN_ID
          : DEMO_DONOR_ID,
    );
    return profile?.isActive ? profile : null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await repository.getProfile(user.id);
  return profile?.isActive ? profile : null;
});

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireDonor(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "donor") redirect(ROLE_HOME[profile.role]);
  return profile;
}

export async function requireNgo(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "ngo") redirect(ROLE_HOME[profile.role]);
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect(ROLE_HOME[profile.role]);
  return profile;
}
