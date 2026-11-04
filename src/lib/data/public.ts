import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isDemoMode, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import { readDemoDatabase } from "@/lib/demo/store";

export interface PublicImpactStats {
  organizations: number;
  donationsShared: number;
  collectionsCompleted: number;
  citiesReached: number;
}

const EMPTY: PublicImpactStats = {
  organizations: 0,
  donationsShared: 0,
  collectionsCompleted: 0,
  citiesReached: 0,
};

/**
 * Honest platform totals for the landing page. In Supabase this calls a
 * security-definer aggregate so no individual donation or private
 * organization field is exposed to anonymous visitors.
 */
export async function getPublicImpactStats(): Promise<PublicImpactStats> {
  if (isDemoMode) {
    const db = await readDemoDatabase();
    return {
      organizations: db.profiles.filter(
        (profile) => profile.role !== "admin" && profile.isActive,
      ).length,
      donationsShared: db.donations.length,
      collectionsCompleted: db.collectionRecords.length,
      citiesReached: new Set(db.donations.map((donation) => donation.city)).size,
    };
  }

  try {
    const supabase = createClient(supabaseUrl(), supabaseAnonKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc("public_impact_stats");
    if (error) return EMPTY;

    const row = (Array.isArray(data) ? data[0] : data) as
      | {
          organizations?: number | string;
          donations_shared?: number | string;
          collections_completed?: number | string;
          cities_reached?: number | string;
        }
      | null;

    return {
      organizations: Number(row?.organizations ?? 0),
      donationsShared: Number(row?.donations_shared ?? 0),
      collectionsCompleted: Number(row?.collections_completed ?? 0),
      citiesReached: Number(row?.cities_reached ?? 0),
    };
  } catch {
    return EMPTY;
  }
}
