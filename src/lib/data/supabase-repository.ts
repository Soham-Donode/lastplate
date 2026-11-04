import type {
  AdminOrganization,
  AdminOverview,
  CollectionRecord,
  CollectionRequest,
  Donation,
  DonationWithDonor,
  DonorOverview,
  NgoOverview,
  Profile,
  PublicProfile,
  VerificationStatus,
} from "@/types";
import type {
  AdminDonationFilters,
  AdminOrganizationFilters,
  AdminRepository,
  BrowseFilters,
  CollectionRequestInput,
  DonationDetail,
  DonationFilters,
  DonationInput,
  DonorRepository,
  NgoDonationDetail,
  NgoRepository,
  ProfileInput,
  RequestFilters,
} from "@/lib/data/types";
import {
  mapDonation,
  mapProfile,
  mapPublicProfile,
  mapRecord,
  mapRequest,
  type CollectionRecordRow,
  type CollectionRequestRow,
  type DonationRow,
  type ProfileRow,
  type PublicProfileRow,
} from "@/lib/data/mappers";
import {
  buildActivity,
  buildDonorOverview,
  buildNgoOverview,
} from "@/lib/data/compute";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function client() {
  return createSupabaseServerClient();
}

/**
 * Reads only the organization-facing columns. The `public_profiles` view is
 * deliberately used instead of `profiles` so email, phone, and address never
 * leave the database for another organization.
 */
async function fetchPublicProfiles(ids: string[]): Promise<PublicProfile[]> {
  if (ids.length === 0) return [];
  const supabase = await client();
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .in("id", Array.from(new Set(ids)));

  if (error) throw new Error(error.message);
  return ((data ?? []) as PublicProfileRow[]).map(mapPublicProfile);
}

function isExpired(donation: Donation) {
  const now = Date.now();
  return (
    new Date(donation.safeUntil).getTime() <= now ||
    new Date(donation.pickupDeadline).getTime() <= now
  );
}

/**
 * Keeps the UI truthful even if the scheduled `expire_stale_donations` job has
 * not run yet: an available donation past its window is never shown as live.
 */
function normalizeDonation(donation: Donation): Donation {
  if (donation.status === "available" && isExpired(donation)) {
    return { ...donation, status: "expired" };
  }
  return donation;
}

async function fetchDonationsByIds(ids: string[]): Promise<Donation[]> {
  if (ids.length === 0) return [];
  const supabase = await client();
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .in("id", Array.from(new Set(ids)));

  if (error) throw new Error(error.message);
  return ((data ?? []) as DonationRow[])
    .map(mapDonation)
    .map(normalizeDonation);
}

async function fetchDonorDonationIds(donorId: string) {
  const supabase = await client();
  const { data, error } = await supabase
    .from("donations")
    .select("id")
    .eq("donor_id", donorId);

  if (error) throw new Error(error.message);
  return ((data ?? []) as { id: string }[]).map((row) => row.id);
}

async function fetchDonorRequests(
  donorId: string,
  filters: RequestFilters = {},
): Promise<CollectionRequest[]> {
  const donationIds = await fetchDonorDonationIds(donorId);
  if (donationIds.length === 0) return [];

  const supabase = await client();
  let query = supabase
    .from("collection_requests")
    .select("*")
    .in("donation_id", donationIds)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as CollectionRequestRow[];
  const [donations, ngos] = await Promise.all([
    fetchDonationsByIds(rows.map((row) => row.donation_id)),
    fetchPublicProfiles(rows.map((row) => row.ngo_id)),
  ]);

  const donationIndex = new Map(donations.map((item) => [item.id, item]));
  const ngoIndex = new Map(ngos.map((item) => [item.id, item]));

  return rows.map((row) =>
    mapRequest(row, donationIndex.get(row.donation_id), ngoIndex.get(row.ngo_id)),
  );
}

export const supabaseDonorRepository: DonorRepository = {
  async getProfile(id): Promise<Profile | null> {
    const supabase = await client();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapProfile(data as ProfileRow) : null;
  },

  async getDonorOverview(donorId): Promise<DonorOverview> {
    const [donations, requests] = await Promise.all([
      supabaseDonorRepository.listDonations(donorId),
      fetchDonorRequests(donorId),
    ]);

    const pendingRequests = requests.filter(
      (request) => request.status === "pending",
    ).length;

    return {
      ...buildDonorOverview(donations, pendingRequests),
      recentRequests: requests.slice(0, 4),
    };
  },

  async getPendingRequestCount(donorId) {
    const donationIds = await fetchDonorDonationIds(donorId);
    if (donationIds.length === 0) return 0;

    const supabase = await client();
    const { count, error } = await supabase
      .from("collection_requests")
      .select("id", { count: "exact", head: true })
      .in("donation_id", donationIds)
      .eq("status", "pending");

    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async listDonations(
    donorId,
    filters: DonationFilters = {},
  ): Promise<Donation[]> {
    const supabase = await client();
    let query = supabase
      .from("donations")
      .select("*")
      .eq("donor_id", donorId)
      .order("created_at", { ascending: false });

    if (filters.status === "available") {
      const now = new Date().toISOString();
      query = query
        .eq("status", "available")
        .gt("safe_until", now)
        .gt("pickup_deadline", now);
    } else if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.q?.trim()) {
      query = query.ilike("title", `%${filters.q.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return ((data ?? []) as DonationRow[])
      .map(mapDonation)
      .map(normalizeDonation);
  },

  async getDonationDetail(donorId, donationId): Promise<DonationDetail | null> {
    const supabase = await client();
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("id", donationId)
      .eq("donor_id", donorId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const donation = normalizeDonation(mapDonation(data as DonationRow));
    const [requests, donorProfile] = await Promise.all([
      fetchDonorRequests(donorId),
      fetchPublicProfiles([donorId]),
    ]);

    const ngoIds = [
      donation.assignedNgoId,
      ...requests
        .filter((request) => request.donationId === donationId)
        .map((request) => request.ngoId),
    ].filter((id): id is string => Boolean(id));

    const ngos = await fetchPublicProfiles(ngoIds);
    const ngoIndex = new Map(ngos.map((ngo) => [ngo.id, ngo]));
    const donor = donorProfile[0];

    const donationWithDonor: DonationWithDonor = {
      ...donation,
      donor: donor
        ? {
            id: donor.id,
            organizationName: donor.organizationName,
            city: donor.city,
          }
        : null,
      assignedNgo: donation.assignedNgoId
        ? {
            id: donation.assignedNgoId,
            organizationName:
              ngoIndex.get(donation.assignedNgoId)?.organizationName ??
              "Assigned NGO",
          }
        : null,
    };

    return {
      donation: donationWithDonor,
      requests: requests.filter(
        (request) => request.donationId === donationId,
      ),
    };
  },

  async createDonation(donorId, input: DonationInput) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("donations")
      .insert({
        donor_id: donorId,
        title: input.title,
        description: input.description,
        category: input.category,
        quantity: input.quantity,
        quantity_unit: input.quantityUnit,
        food_type: input.foodType,
        allergens: input.allergens?.trim() || null,
        image_url: input.imageUrl ?? null,
        prepared_at: input.preparedAt,
        safe_until: input.safeUntil,
        pickup_deadline: input.pickupDeadline,
        pickup_address: input.pickupAddress,
        city: input.city,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        additional_instructions: input.additionalInstructions?.trim() || null,
        status: "available",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: (data as { id: string }).id };
  },

  async listRequests(donorId, filters: RequestFilters = {}) {
    return fetchDonorRequests(donorId, filters);
  },

  async respondToRequest(donorId, requestId, action) {
    const supabase = await client();
    const { error } = await supabase.rpc("respond_to_collection_request", {
      p_request_id: requestId,
      p_action: action,
    });

    if (error) {
      throw new Error(
        error.message ||
          "We could not update this request. Refresh the page and try again.",
      );
    }

    // The RPC verifies ownership; this read keeps the contract explicit.
    void donorId;
  },

  async markCollected(donorId, donationId, notes) {
    const supabase = await client();
    const { error } = await supabase.rpc("mark_donation_collected", {
      p_donation_id: donationId,
      p_notes: notes ?? null,
    });

    if (error) {
      throw new Error(
        error.message ||
          "We could not record this collection. Refresh the page and try again.",
      );
    }

    void donorId;
  },

  async listHistory(donorId): Promise<CollectionRecord[]> {
    const supabase = await client();
    const { data, error } = await supabase
      .from("collection_records")
      .select("*")
      .eq("donor_id", donorId)
      .order("collected_at", { ascending: false });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as CollectionRecordRow[];
    const [donations, ngos] = await Promise.all([
      fetchDonationsByIds(rows.map((row) => row.donation_id)),
      fetchPublicProfiles(rows.map((row) => row.ngo_id)),
    ]);

    const donationIndex = new Map(donations.map((item) => [item.id, item]));
    const ngoIndex = new Map(ngos.map((item) => [item.id, item]));

    return rows.map((row) =>
      mapRecord(row, donationIndex.get(row.donation_id), ngoIndex.get(row.ngo_id)),
    );
  },

  async updateProfile(userId, input: ProfileInput): Promise<Profile> {
    const supabase = await client();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: input.fullName,
        organization_name: input.organizationName,
        organization_type: input.organizationType,
        phone: input.phone,
        city: input.city,
        address: input.address,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return mapProfile(data as ProfileRow);
  },
};

function withDonor(
  donation: Donation,
  donor: PublicProfile | undefined,
): DonationWithDonor {
  return {
    ...donation,
    donor: donor
      ? {
          id: donor.id,
          organizationName: donor.organizationName,
          city: donor.city,
        }
      : null,
    assignedNgo: null,
  };
}

async function fetchNgoRequests(
  ngoId: string,
  filters: RequestFilters = {},
): Promise<CollectionRequest[]> {
  const supabase = await client();
  let query = supabase
    .from("collection_requests")
    .select("*")
    .eq("ngo_id", ngoId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as CollectionRequestRow[];
  const [donations, ngos] = await Promise.all([
    fetchDonationsByIds(rows.map((row) => row.donation_id)),
    fetchPublicProfiles([ngoId]),
  ]);

  const donationIndex = new Map(donations.map((item) => [item.id, item]));
  const ngo = ngos[0];

  return rows.map((row) =>
    mapRequest(row, donationIndex.get(row.donation_id), ngo),
  );
}

async function fetchAssignedDonations(ngoId: string) {
  const supabase = await client();
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("assigned_ngo_id", ngoId)
    .eq("status", "assigned")
    .order("pickup_deadline", { ascending: true });

  if (error) throw new Error(error.message);

  const donations = ((data ?? []) as DonationRow[])
    .map(mapDonation)
    .map(normalizeDonation);
  const donors = await fetchPublicProfiles(
    donations.map((donation) => donation.donorId),
  );
  const donorIndex = new Map(donors.map((donor) => [donor.id, donor]));

  return donations.map((donation) =>
    withDonor(donation, donorIndex.get(donation.donorId)),
  );
}

export const supabaseNgoRepository: NgoRepository = {
  async getNgoOverview(ngoId): Promise<NgoOverview> {
    const [available, requests, collections, upcomingPickups] =
      await Promise.all([
        supabaseNgoRepository.listAvailableDonations(ngoId),
        fetchNgoRequests(ngoId),
        supabaseNgoRepository.listCollections(ngoId),
        fetchAssignedDonations(ngoId),
      ]);

    return buildNgoOverview(
      requests,
      collections,
      available.length,
      available,
      upcomingPickups,
    );
  },

  async getPendingRequestCount(ngoId) {
    const supabase = await client();
    const { count, error } = await supabase
      .from("collection_requests")
      .select("id", { count: "exact", head: true })
      .eq("ngo_id", ngoId)
      .eq("status", "pending");

    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async listAvailableDonations(
    _ngoId,
    filters: BrowseFilters = {},
  ): Promise<DonationWithDonor[]> {
    const supabase = await client();
    const now = new Date().toISOString();
    let query = supabase
      .from("donations")
      .select("*")
      .eq("status", "available")
      .gt("safe_until", now)
      .gt("pickup_deadline", now);

    if (filters.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    if (filters.foodType && filters.foodType !== "all") {
      query = query.eq("food_type", filters.foodType);
    }

    if (filters.city && filters.city !== "all") {
      query = query.eq("city", filters.city);
    }

    if (filters.q?.trim()) {
      query = query.ilike("title", `%${filters.q.trim()}%`);
    }

    const { data, error } = await query.order(
      filters.sort === "deadline" ? "pickup_deadline" : "created_at",
      { ascending: filters.sort === "deadline" },
    );

    if (error) throw new Error(error.message);

    const donations = ((data ?? []) as DonationRow[])
      .map(mapDonation)
      .map(normalizeDonation);
    const donors = await fetchPublicProfiles(
      donations.map((donation) => donation.donorId),
    );
    const donorIndex = new Map(donors.map((donor) => [donor.id, donor]));

    return donations.map((donation) =>
      withDonor(donation, donorIndex.get(donation.donorId)),
    );
  },

  async listAvailableCities() {
    const supabase = await client();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("donations")
      .select("city")
      .eq("status", "available")
      .gt("safe_until", now)
      .gt("pickup_deadline", now);

    if (error) throw new Error(error.message);

    return Array.from(
      new Set(
        ((data ?? []) as { city: string }[]).map((row) => row.city),
      ),
    ).sort();
  },

  async getDonationDetail(
    ngoId,
    donationId,
  ): Promise<NgoDonationDetail | null> {
    const supabase = await client();
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("id", donationId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const donation = normalizeDonation(mapDonation(data as DonationRow));
    const profileIds = [donation.donorId, donation.assignedNgoId].filter(
      (id): id is string => Boolean(id),
    );

    const [requestResult, profiles] = await Promise.all([
      supabase
        .from("collection_requests")
        .select("*")
        .eq("donation_id", donationId)
        .eq("ngo_id", ngoId)
        .maybeSingle(),
      fetchPublicProfiles(profileIds),
    ]);

    if (requestResult.error) throw new Error(requestResult.error.message);

    const profileIndex = new Map(profiles.map((item) => [item.id, item]));
    const donor = profileIndex.get(donation.donorId);
    const assigned = donation.assignedNgoId
      ? profileIndex.get(donation.assignedNgoId)
      : undefined;

    return {
      donation: {
        ...withDonor(donation, donor),
        assignedNgo: assigned
          ? { id: assigned.id, organizationName: assigned.organizationName }
          : null,
      },
      myRequest: requestResult.data
        ? mapRequest(
            requestResult.data as CollectionRequestRow,
            donation,
            undefined,
          )
        : null,
    };
  },

  async createRequest(ngoId, donationId, input: CollectionRequestInput) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("collection_requests")
      .insert({
        donation_id: donationId,
        ngo_id: ngoId,
        requested_quantity: input.requestedQuantity,
        message: input.message?.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: (data as { id: string }).id };
  },

  async listRequests(ngoId, filters: RequestFilters = {}) {
    return fetchNgoRequests(ngoId, filters);
  },

  async cancelRequest(ngoId, requestId) {
    const supabase = await client();
    const { error } = await supabase.rpc("cancel_collection_request", {
      p_request_id: requestId,
    });

    if (error) {
      throw new Error(
        error.message ||
          "We could not cancel this request. Refresh the page and try again.",
      );
    }

    void ngoId;
  },

  async confirmCollection(ngoId, donationId, notes) {
    const supabase = await client();
    const { error } = await supabase.rpc("mark_donation_collected", {
      p_donation_id: donationId,
      p_notes: notes ?? null,
    });

    if (error) {
      throw new Error(
        error.message ||
          "We could not confirm this collection. Refresh the page and try again.",
      );
    }

    void ngoId;
  },

  async listCollections(ngoId): Promise<CollectionRecord[]> {
    const supabase = await client();
    const { data, error } = await supabase
      .from("collection_records")
      .select("*")
      .eq("ngo_id", ngoId)
      .order("collected_at", { ascending: false });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as CollectionRecordRow[];
    const donations = await fetchDonationsByIds(
      rows.map((row) => row.donation_id),
    );
    const donationIndex = new Map(donations.map((item) => [item.id, item]));

    return rows.map((row) =>
      mapRecord(row, donationIndex.get(row.donation_id), undefined),
    );
  },

  async updateProfile(userId, input: ProfileInput) {
    return supabaseDonorRepository.updateProfile(userId, input);
  },
};

function joinAdminDonation(
  donation: Donation,
  profiles: Map<string, Profile>,
): DonationWithDonor {
  const donor = profiles.get(donation.donorId);
  const assignedNgo = donation.assignedNgoId
    ? profiles.get(donation.assignedNgoId)
    : undefined;

  return {
    ...donation,
    donor: donor
      ? {
          id: donor.id,
          organizationName: donor.organizationName,
          city: donor.city,
        }
      : null,
    assignedNgo: assignedNgo
      ? { id: assignedNgo.id, organizationName: assignedNgo.organizationName }
      : null,
  };
}

export const supabaseAdminRepository: AdminRepository = {
  async getAdminOverview(): Promise<AdminOverview> {
    const supabase = await client();
    const [profilesResult, donationsResult, recordsResult] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("donations").select("*").order("created_at", {
        ascending: false,
      }),
      supabase
        .from("collection_records")
        .select("*")
        .order("collected_at", { ascending: false }),
    ]);

    if (profilesResult.error) throw new Error(profilesResult.error.message);
    if (donationsResult.error) throw new Error(donationsResult.error.message);
    if (recordsResult.error) throw new Error(recordsResult.error.message);

    const profiles = ((profilesResult.data ?? []) as ProfileRow[]).map(
      mapProfile,
    );
    const donations = ((donationsResult.data ?? []) as DonationRow[])
      .map(mapDonation)
      .map(normalizeDonation);
    const recordRows = (recordsResult.data ?? []) as CollectionRecordRow[];
    const profileIndex = new Map(profiles.map((profile) => [profile.id, profile]));
    const donationIndex = new Map(
      donations.map((donation) => [donation.id, donation]),
    );

    const organizations = profiles.filter(
      (profile) => profile.role === "donor" || profile.role === "ngo",
    );
    const pendingNgos = organizations
      .filter(
        (profile) =>
          profile.role === "ngo" &&
          profile.verificationStatus === "pending" &&
          profile.isActive,
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    const now = Date.now();
    const activeDonations = donations.filter(
      (donation) =>
        (donation.status === "available" || donation.status === "assigned") &&
        new Date(donation.pickupDeadline).getTime() > now,
    ).length;
    const foodRescued = donations
      .filter((donation) => donation.status === "collected")
      .filter((donation) => donation.quantityUnit === "kg")
      .reduce((total, donation) => total + donation.quantity, 0);
    const recentCollections = recordRows
      .slice(0, 5)
      .map((row) =>
        mapRecord(
          row,
          donationIndex.get(row.donation_id),
          profileIndex.get(row.ngo_id),
        ),
      );

    return {
      totalOrganizations: organizations.length,
      donors: organizations.filter((profile) => profile.role === "donor")
        .length,
      ngos: organizations.filter((profile) => profile.role === "ngo").length,
      pendingVerification: pendingNgos.length,
      activeAccounts: organizations.filter((profile) => profile.isActive).length,
      disabledAccounts: organizations.filter((profile) => !profile.isActive)
        .length,
      activeDonations,
      completedCollections: recordRows.length,
      foodRescued,
      pendingNgos: pendingNgos.slice(0, 4),
      recentDonations: donations
        .slice(0, 5)
        .map((donation) => joinAdminDonation(donation, profileIndex)),
      recentCollections,
      activity: buildActivity(donations, 7),
    };
  },

  async getPendingVerificationCount() {
    const supabase = await client();
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "ngo")
      .eq("verification_status", "pending")
      .eq("is_active", true);

    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async listOrganizations(
    filters: AdminOrganizationFilters = {},
  ): Promise<AdminOrganization[]> {
    const supabase = await client();
    const [profilesResult, donationsResult, recordsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .in("role", ["donor", "ngo"])
        .order("created_at", { ascending: false }),
      supabase.from("donations").select("donor_id"),
      supabase.from("collection_records").select("donor_id, ngo_id"),
    ]);

    if (profilesResult.error) throw new Error(profilesResult.error.message);
    if (donationsResult.error) throw new Error(donationsResult.error.message);
    if (recordsResult.error) throw new Error(recordsResult.error.message);

    const donationRows = (donationsResult.data ?? []) as {
      donor_id: string;
    }[];
    const recordRows = (recordsResult.data ?? []) as {
      donor_id: string;
      ngo_id: string;
    }[];
    const query = filters.q?.trim().toLowerCase();

    return ((profilesResult.data ?? []) as ProfileRow[])
      .map(mapProfile)
      .filter(
        (profile) =>
          !filters.role ||
          filters.role === "all" ||
          profile.role === filters.role,
      )
      .filter(
        (profile) =>
          !filters.verification ||
          filters.verification === "all" ||
          profile.verificationStatus === filters.verification,
      )
      .filter(
        (profile) =>
          !filters.state ||
          filters.state === "all" ||
          (filters.state === "active" ? profile.isActive : !profile.isActive),
      )
      .filter(
        (profile) =>
          !query ||
          profile.organizationName.toLowerCase().includes(query) ||
          profile.fullName.toLowerCase().includes(query) ||
          profile.email.toLowerCase().includes(query) ||
          profile.city.toLowerCase().includes(query),
      )
      .map<AdminOrganization>((profile) => ({
        profile,
        donationsPublished: donationRows.filter(
          (row) => row.donor_id === profile.id,
        ).length,
        collectionsCompleted: recordRows.filter((row) =>
          profile.role === "ngo"
            ? row.ngo_id === profile.id
            : row.donor_id === profile.id,
        ).length,
      }))
      .sort((a, b) => {
        const aPending =
          a.profile.role === "ngo" &&
          a.profile.verificationStatus === "pending"
            ? 0
            : 1;
        const bPending =
          b.profile.role === "ngo" &&
          b.profile.verificationStatus === "pending"
            ? 0
            : 1;

        if (aPending !== bPending) return aPending - bPending;

        return (
          new Date(b.profile.createdAt).getTime() -
          new Date(a.profile.createdAt).getTime()
        );
      });
  },

  async listDonations(
    filters: AdminDonationFilters = {},
  ): Promise<DonationWithDonor[]> {
    const supabase = await client();
    let query = supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.q?.trim()) {
      query = query.ilike("title", `%${filters.q.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const donations = ((data ?? []) as DonationRow[])
      .map(mapDonation)
      .map(normalizeDonation);
    const profiles = await fetchPublicProfiles(
      donations.flatMap((donation) =>
        donation.assignedNgoId
          ? [donation.donorId, donation.assignedNgoId]
          : [donation.donorId],
      ),
    );
    const profileIndex = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );

    return donations.map((donation) => {
      const donor = profileIndex.get(donation.donorId);
      const assignedNgo = donation.assignedNgoId
        ? profileIndex.get(donation.assignedNgoId)
        : undefined;

      return {
        ...donation,
        donor: donor
          ? {
              id: donor.id,
              organizationName: donor.organizationName,
              city: donor.city,
            }
          : null,
        assignedNgo: assignedNgo
          ? {
              id: assignedNgo.id,
              organizationName: assignedNgo.organizationName,
            }
          : null,
      };
    });
  },

  async setNgoVerification(
    adminId,
    ngoId,
    status: VerificationStatus,
  ): Promise<void> {
    const supabase = await client();
    const { error } = await supabase.rpc("admin_set_ngo_verification", {
      p_ngo_id: ngoId,
      p_status: status,
    });

    if (error) {
      throw new Error(
        error.message ||
          "We could not update this NGO. Refresh the page and try again.",
      );
    }

    void adminId;
  },

  async setProfileActive(adminId, profileId, isActive) {
    const supabase = await client();
    const { error } = await supabase.rpc("admin_set_profile_active", {
      p_profile_id: profileId,
      p_is_active: isActive,
    });

    if (error) {
      throw new Error(
        error.message ||
          "We could not update this account. Refresh the page and try again.",
      );
    }

    void adminId;
  },
};
