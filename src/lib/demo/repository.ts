import { randomUUID } from "node:crypto";
import type {
  AdminOrganization,
  AdminOverview,
  CollectionRecord,
  Donation,
  DonationWithDonor,
  DonorOverview,
  NgoOverview,
  Profile,
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
  buildActivity,
  buildDonorOverview,
  buildNgoOverview,
} from "@/lib/data/compute";
import type { DemoDatabase, DemoRequestRow } from "./seed";
import { mutateDemoDatabase, readDemoDatabase } from "./store";

function profileRef(profile: Profile | undefined) {
  return profile
    ? {
        id: profile.id,
        organizationName: profile.organizationName,
        city: profile.city,
      }
    : null;
}

function joinRequest(db: DemoDatabase, request: DemoRequestRow) {
  const donation = db.donations.find((item) => item.id === request.donationId);
  const ngo = db.profiles.find((item) => item.id === request.ngoId);

  return {
    ...request,
    donation: donation
      ? {
          id: donation.id,
          title: donation.title,
          quantity: donation.quantity,
          quantityUnit: donation.quantityUnit,
          status: donation.status,
          pickupDeadline: donation.pickupDeadline,
        }
      : null,
    ngo: profileRef(ngo),
  };
}

function joinDonation(db: DemoDatabase, donation: Donation): DonationWithDonor {
  const donor = db.profiles.find((item) => item.id === donation.donorId);
  const assignedNgo = donation.assignedNgoId
    ? db.profiles.find((item) => item.id === donation.assignedNgoId)
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

function donorRequests(db: DemoDatabase, donorId: string) {
  const donationIds = new Set(
    db.donations
      .filter((donation) => donation.donorId === donorId)
      .map((donation) => donation.id),
  );

  return db.collectionRequests
    .filter((request) => donationIds.has(request.donationId))
    .map((request) => joinRequest(db, request))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function ngoRequests(db: DemoDatabase, ngoId: string) {
  return db.collectionRequests
    .filter((request) => request.ngoId === ngoId)
    .map((request) => joinRequest(db, request))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function isDonationOpen(donation: Donation, now = new Date()) {
  return (
    donation.status === "available" &&
    new Date(donation.safeUntil).getTime() > now.getTime() &&
    new Date(donation.pickupDeadline).getTime() > now.getTime()
  );
}

function joinedRecords(db: DemoDatabase, records: DemoDatabase["collectionRecords"]) {
  return records
    .map<CollectionRecord>((record) => {
      const donation = db.donations.find(
        (item) => item.id === record.donationId,
      );
      const ngo = db.profiles.find((item) => item.id === record.ngoId);

      return {
        ...record,
        quantityUnit: donation?.quantityUnit ?? "kg",
        donation: donation
          ? {
              id: donation.id,
              title: donation.title,
              category: donation.category,
              quantityUnit: donation.quantityUnit,
            }
          : null,
        ngo: ngo
          ? { id: ngo.id, organizationName: ngo.organizationName }
          : null,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
    );
}

export const demoDonorRepository: DonorRepository = {
  async getProfile(id) {
    const db = await readDemoDatabase();
    return db.profiles.find((profile) => profile.id === id) ?? null;
  },

  async getDonorOverview(donorId): Promise<DonorOverview> {
    const db = await readDemoDatabase();
    const donations = db.donations.filter(
      (donation) => donation.donorId === donorId,
    );
    const requests = donorRequests(db, donorId);
    const pendingRequests = requests.filter(
      (request) => request.status === "pending",
    ).length;

    return {
      ...buildDonorOverview(donations, pendingRequests),
      recentRequests: requests.slice(0, 4),
    };
  },

  async getPendingRequestCount(donorId) {
    const db = await readDemoDatabase();
    const requests = donorRequests(db, donorId);
    return requests.filter((request) => request.status === "pending").length;
  },

  async listDonations(donorId, filters: DonationFilters = {}) {
    const db = await readDemoDatabase();
    const query = filters.q?.trim().toLowerCase();

    return db.donations
      .filter((donation) => donation.donorId === donorId)
      .filter(
        (donation) =>
          !filters.status ||
          filters.status === "all" ||
          donation.status === filters.status,
      )
      .filter(
        (donation) => !query || donation.title.toLowerCase().includes(query),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },

  async getDonationDetail(donorId, donationId): Promise<DonationDetail | null> {
    const db = await readDemoDatabase();
    const donation = db.donations.find(
      (item) => item.id === donationId && item.donorId === donorId,
    );

    if (!donation) return null;

    const requests = donorRequests(db, donorId).filter(
      (request) => request.donationId === donationId,
    );

    return { donation: joinDonation(db, donation), requests };
  },

  async createDonation(donorId, input: DonationInput) {
    const id = randomUUID();
    const now = new Date().toISOString();

    await mutateDemoDatabase((db) => {
      const donation: Donation = {
        id,
        donorId,
        title: input.title,
        description: input.description,
        category: input.category,
        quantity: input.quantity,
        quantityUnit: input.quantityUnit,
        foodType: input.foodType,
        allergens: input.allergens?.trim() || null,
        imageUrl: input.imageUrl ?? null,
        preparedAt: input.preparedAt,
        safeUntil: input.safeUntil,
        pickupDeadline: input.pickupDeadline,
        pickupAddress: input.pickupAddress,
        city: input.city,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        additionalInstructions:
          input.additionalInstructions?.trim() || null,
        status: "available",
        assignedNgoId: null,
        createdAt: now,
        updatedAt: now,
      };

      db.donations.unshift(donation);
    });

    return { id };
  },

  async listRequests(donorId, filters: RequestFilters = {}) {
    const db = await readDemoDatabase();
    return donorRequests(db, donorId).filter(
      (request) =>
        !filters.status ||
        filters.status === "all" ||
        request.status === filters.status,
    );
  },

  async respondToRequest(donorId, requestId, action) {
    await mutateDemoDatabase((db) => {
      const request = db.collectionRequests.find((item) => item.id === requestId);
      const donation = request
        ? db.donations.find((item) => item.id === request.donationId)
        : undefined;

      if (!request || !donation || donation.donorId !== donorId) {
        throw new Error("Request not found.");
      }

      if (request.status !== "pending") {
        throw new Error("This request is no longer pending.");
      }

      const now = new Date();

      if (
        donation.status !== "available" ||
        new Date(donation.safeUntil).getTime() <= now.getTime()
      ) {
        throw new Error(
          "This donation is no longer available. Refresh the page to see the latest state.",
        );
      }

      const timestamp = now.toISOString();
      request.updatedAt = timestamp;

      if (action === "reject") {
        request.status = "rejected";
        return;
      }

      donation.status = "assigned";
      donation.assignedNgoId = request.ngoId;
      donation.updatedAt = timestamp;
      request.status = "accepted";

      for (const other of db.collectionRequests) {
        if (
          other.id !== request.id &&
          other.donationId === donation.id &&
          other.status === "pending"
        ) {
          other.status = "rejected";
          other.updatedAt = timestamp;
        }
      }
    });
  },

  async markCollected(donorId, donationId, notes) {
    await mutateDemoDatabase((db) => {
      const donation = db.donations.find(
        (item) => item.id === donationId && item.donorId === donorId,
      );

      if (!donation) throw new Error("Donation not found.");

      if (donation.status !== "assigned" || !donation.assignedNgoId) {
        throw new Error(
          "Only a donation assigned to an NGO can be marked as collected.",
        );
      }

      if (
        db.collectionRecords.some(
          (record) => record.donationId === donation.id,
        )
      ) {
        throw new Error("This collection has already been recorded.");
      }

      const timestamp = new Date().toISOString();

      db.collectionRecords.unshift({
        id: randomUUID(),
        donationId: donation.id,
        ngoId: donation.assignedNgoId,
        donorId,
        collectedQuantity: donation.quantity,
        collectedAt: timestamp,
        notes: notes?.trim() || null,
      });
      donation.status = "collected";
      donation.updatedAt = timestamp;

      for (const request of db.collectionRequests) {
        if (
          request.donationId === donation.id &&
          request.status === "accepted"
        ) {
          request.status = "completed";
          request.updatedAt = timestamp;
        }
      }
    });
  },

  async listHistory(donorId): Promise<CollectionRecord[]> {
    const db = await readDemoDatabase();

    return db.collectionRecords
      .filter((record) => record.donorId === donorId)
      .map((record) => {
        const donation = db.donations.find(
          (item) => item.id === record.donationId,
        );
        const ngo = db.profiles.find((item) => item.id === record.ngoId);

        return {
          ...record,
          quantityUnit: donation?.quantityUnit ?? "kg",
          donation: donation
            ? {
                id: donation.id,
                title: donation.title,
                category: donation.category,
                quantityUnit: donation.quantityUnit,
              }
            : null,
          ngo: ngo
            ? { id: ngo.id, organizationName: ngo.organizationName }
            : null,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.collectedAt).getTime() -
          new Date(a.collectedAt).getTime(),
      );
  },

  async updateProfile(userId, input: ProfileInput) {
    let updated: Profile | null = null;

    await mutateDemoDatabase((db) => {
      const profile = db.profiles.find((item) => item.id === userId);
      if (!profile) throw new Error("Profile not found.");

      Object.assign(profile, {
        fullName: input.fullName,
        organizationName: input.organizationName,
        organizationType: input.organizationType,
        phone: input.phone,
        city: input.city,
        address: input.address,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        updatedAt: new Date().toISOString(),
      });

      updated = { ...profile };
    });

    if (!updated) throw new Error("Profile not found.");
    return updated;
  },
};

export const demoNgoRepository: NgoRepository = {
  async getNgoOverview(ngoId): Promise<NgoOverview> {
    const db = await readDemoDatabase();
    const now = new Date();
    const ngo = db.profiles.find((profile) => profile.id === ngoId);
    const available = db.donations.filter((donation) =>
      isDonationOpen(donation, now),
    );
    const nearby = [...available]
      .sort((a, b) => {
        const aLocal = a.city === ngo?.city ? 1 : 0;
        const bLocal = b.city === ngo?.city ? 1 : 0;
        if (aLocal !== bLocal) return bLocal - aLocal;
        return (
          new Date(a.pickupDeadline).getTime() -
          new Date(b.pickupDeadline).getTime()
        );
      })
      .map((donation) => joinDonation(db, donation));

    const upcomingPickups = db.donations
      .filter(
        (donation) =>
          donation.assignedNgoId === ngoId && donation.status === "assigned",
      )
      .map((donation) => joinDonation(db, donation));

    const collections = joinedRecords(
      db,
      db.collectionRecords.filter((record) => record.ngoId === ngoId),
    );

    return buildNgoOverview(
      ngoRequests(db, ngoId),
      collections,
      available.length,
      nearby,
      upcomingPickups,
      now,
    );
  },

  async getPendingRequestCount(ngoId) {
    const db = await readDemoDatabase();
    return db.collectionRequests.filter(
      (request) => request.ngoId === ngoId && request.status === "pending",
    ).length;
  },

  async listAvailableDonations(_ngoId, filters: BrowseFilters = {}) {
    const db = await readDemoDatabase();
    const now = new Date();
    const query = filters.q?.trim().toLowerCase();
    const donations = db.donations
      .filter((donation) => isDonationOpen(donation, now))
      .filter(
        (donation) =>
          !filters.category ||
          filters.category === "all" ||
          donation.category === filters.category,
      )
      .filter(
        (donation) =>
          !filters.foodType ||
          filters.foodType === "all" ||
          donation.foodType === filters.foodType,
      )
      .filter(
        (donation) =>
          !filters.city ||
          filters.city === "all" ||
          donation.city === filters.city,
      )
      .filter(
        (donation) => !query || donation.title.toLowerCase().includes(query),
      )
      .sort((a, b) =>
        filters.sort === "deadline"
          ? new Date(a.pickupDeadline).getTime() -
            new Date(b.pickupDeadline).getTime()
          : new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
      );

    return donations.map((donation) => joinDonation(db, donation));
  },

  async listAvailableCities() {
    const db = await readDemoDatabase();
    const now = new Date();
    return Array.from(
      new Set(
        db.donations
          .filter((donation) => isDonationOpen(donation, now))
          .map((donation) => donation.city),
      ),
    ).sort();
  },

  async getDonationDetail(ngoId, donationId): Promise<NgoDonationDetail | null> {
    const db = await readDemoDatabase();
    const donation = db.donations.find((item) => item.id === donationId);
    if (!donation) return null;

    const rawRequest =
      db.collectionRequests.find(
        (request) =>
          request.donationId === donationId && request.ngoId === ngoId,
      ) ?? null;

    const visible =
      isDonationOpen(donation) ||
      donation.assignedNgoId === ngoId ||
      rawRequest !== null;

    if (!visible) return null;

    return {
      donation: joinDonation(db, donation),
      myRequest: rawRequest ? joinRequest(db, rawRequest) : null,
    };
  },

  async createRequest(ngoId, donationId, input: CollectionRequestInput) {
    const id = randomUUID();

    await mutateDemoDatabase((db) => {
      const ngo = db.profiles.find(
        (profile) =>
          profile.id === ngoId &&
          profile.role === "ngo" &&
          profile.verificationStatus === "verified",
      );

      if (!ngo) {
        throw new Error("Only verified NGOs can request collections.");
      }

      const donation = db.donations.find((item) => item.id === donationId);
      if (!donation) throw new Error("Donation not found.");

      if (!isDonationOpen(donation)) {
        throw new Error(
          "This donation is no longer available. Refresh the page to see the latest listings.",
        );
      }

      if (input.requestedQuantity > donation.quantity) {
        throw new Error("Requested quantity exceeds the available quantity.");
      }

      if (
        db.collectionRequests.some(
          (request) =>
            request.donationId === donationId && request.ngoId === ngoId,
        )
      ) {
        throw new Error("You have already requested this donation.");
      }

      const now = new Date().toISOString();
      db.collectionRequests.unshift({
        id,
        donationId,
        ngoId,
        requestedQuantity: input.requestedQuantity,
        message: input.message?.trim() || null,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      });
    });

    return { id };
  },

  async listRequests(ngoId, filters: RequestFilters = {}) {
    const db = await readDemoDatabase();
    return ngoRequests(db, ngoId).filter(
      (request) =>
        !filters.status ||
        filters.status === "all" ||
        request.status === filters.status,
    );
  },

  async cancelRequest(ngoId, requestId) {
    await mutateDemoDatabase((db) => {
      const request = db.collectionRequests.find(
        (item) => item.id === requestId && item.ngoId === ngoId,
      );

      if (!request) throw new Error("Request not found.");
      if (request.status !== "pending") {
        throw new Error("Only pending requests can be cancelled.");
      }

      request.status = "cancelled";
      request.updatedAt = new Date().toISOString();
    });
  },

  async confirmCollection(ngoId, donationId, notes) {
    await mutateDemoDatabase((db) => {
      const donation = db.donations.find((item) => item.id === donationId);

      if (!donation) throw new Error("Donation not found.");

      if (
        donation.status !== "assigned" ||
        donation.assignedNgoId !== ngoId
      ) {
        throw new Error(
          "Only the assigned NGO can confirm this collection.",
        );
      }

      if (
        db.collectionRecords.some(
          (record) => record.donationId === donation.id,
        )
      ) {
        throw new Error("This collection has already been recorded.");
      }

      const timestamp = new Date().toISOString();

      db.collectionRecords.unshift({
        id: randomUUID(),
        donationId: donation.id,
        ngoId,
        donorId: donation.donorId,
        collectedQuantity: donation.quantity,
        collectedAt: timestamp,
        notes: notes?.trim() || null,
      });
      donation.status = "collected";
      donation.updatedAt = timestamp;

      for (const request of db.collectionRequests) {
        if (
          request.donationId === donation.id &&
          request.status === "accepted"
        ) {
          request.status = "completed";
          request.updatedAt = timestamp;
        }
      }
    });
  },

  async listCollections(ngoId) {
    const db = await readDemoDatabase();
    return joinedRecords(
      db,
      db.collectionRecords.filter((record) => record.ngoId === ngoId),
    );
  },

  async updateProfile(userId, input: ProfileInput) {
    return demoDonorRepository.updateProfile(userId, input);
  },
};

function isActionableDonation(donation: Donation, now = new Date()) {
  return (
    (donation.status === "available" || donation.status === "assigned") &&
    new Date(donation.pickupDeadline).getTime() > now.getTime()
  );
}

function requireDemoAdmin(db: DemoDatabase, adminId: string) {
  const admin = db.profiles.find(
    (profile) =>
      profile.id === adminId &&
      profile.role === "admin" &&
      profile.isActive,
  );

  if (!admin) {
    throw new Error("Only an active administrator can perform this action.");
  }

  return admin;
}

export const demoAdminRepository: AdminRepository = {
  async getAdminOverview(): Promise<AdminOverview> {
    const db = await readDemoDatabase();
    const now = new Date();
    const organizations = db.profiles.filter(
      (profile) => profile.role === "donor" || profile.role === "ngo",
    );
    const pendingNgos = organizations
      .filter(
        (profile) =>
          profile.role === "ngo" && profile.verificationStatus === "pending",
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    const collections = joinedRecords(db, db.collectionRecords);
    const foodRescued = db.donations
      .filter((donation) => donation.status === "collected")
      .filter((donation) => donation.quantityUnit === "kg")
      .reduce((total, donation) => total + donation.quantity, 0);

    return {
      totalOrganizations: organizations.length,
      donors: organizations.filter((profile) => profile.role === "donor")
        .length,
      ngos: organizations.filter((profile) => profile.role === "ngo").length,
      pendingVerification: pendingNgos.length,
      activeAccounts: organizations.filter((profile) => profile.isActive).length,
      disabledAccounts: organizations.filter((profile) => !profile.isActive)
        .length,
      activeDonations: db.donations.filter((donation) =>
        isActionableDonation(donation, now),
      ).length,
      completedCollections: db.collectionRecords.length,
      foodRescued,
      pendingNgos: pendingNgos.slice(0, 4),
      recentDonations: [...db.donations]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5)
        .map((donation) => joinDonation(db, donation)),
      recentCollections: collections.slice(0, 5),
      activity: buildActivity(db.donations, 7, now),
    };
  },

  async getPendingVerificationCount() {
    const db = await readDemoDatabase();
    return db.profiles.filter(
      (profile) =>
        profile.role === "ngo" &&
        profile.verificationStatus === "pending" &&
        profile.isActive,
    ).length;
  },

  async listOrganizations(
    filters: AdminOrganizationFilters = {},
  ): Promise<AdminOrganization[]> {
    const db = await readDemoDatabase();
    const query = filters.q?.trim().toLowerCase();

    return db.profiles
      .filter(
        (profile) => profile.role === "donor" || profile.role === "ngo",
      )
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
        donationsPublished: db.donations.filter(
          (donation) => donation.donorId === profile.id,
        ).length,
        collectionsCompleted: db.collectionRecords.filter((record) =>
          profile.role === "ngo"
            ? record.ngoId === profile.id
            : record.donorId === profile.id,
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
    const db = await readDemoDatabase();
    const query = filters.q?.trim().toLowerCase();

    return db.donations
      .filter(
        (donation) =>
          !filters.status ||
          filters.status === "all" ||
          donation.status === filters.status,
      )
      .filter(
        (donation) => !query || donation.title.toLowerCase().includes(query),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((donation) => joinDonation(db, donation));
  },

  async setNgoVerification(adminId, ngoId, status) {
    await mutateDemoDatabase((db) => {
      requireDemoAdmin(db, adminId);

      const ngo = db.profiles.find((profile) => profile.id === ngoId);

      if (!ngo || ngo.role !== "ngo") {
        throw new Error("NGO not found.");
      }

      const timestamp = new Date().toISOString();
      ngo.verificationStatus = status;
      ngo.updatedAt = timestamp;

      // A request from an unverified NGO can never be accepted, so close the
      // pending ones instead of leaving the donor with a dead request.
      if (status !== "verified") {
        for (const request of db.collectionRequests) {
          if (request.ngoId === ngoId && request.status === "pending") {
            request.status = "rejected";
            request.updatedAt = timestamp;
          }
        }
      }
    });
  },

  async setProfileActive(adminId, profileId, isActive) {
    await mutateDemoDatabase((db) => {
      requireDemoAdmin(db, adminId);

      const profile = db.profiles.find((item) => item.id === profileId);

      if (!profile) throw new Error("Account not found.");
      if (profile.role === "admin") {
        throw new Error("Administrator accounts cannot be disabled here.");
      }
      if (profile.id === adminId) {
        throw new Error("You cannot disable your own account.");
      }

      const timestamp = new Date().toISOString();
      profile.isActive = isActive;
      profile.updatedAt = timestamp;

      if (!isActive) {
        for (const request of db.collectionRequests) {
          if (request.ngoId === profileId && request.status === "pending") {
            request.status = "rejected";
            request.updatedAt = timestamp;
          }
        }

        // A disabled donor cannot review requests, so leaving listings open
        // would only strand NGOs. Assigned pickups stay available to complete.
        if (profile.role === "donor") {
          for (const donation of db.donations) {
            if (
              donation.donorId === profileId &&
              donation.status === "available"
            ) {
              donation.status = "cancelled";
              donation.updatedAt = timestamp;
            }
          }
        }
      }
    });
  },
};
