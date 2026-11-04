import type {
  AdminOrganization,
  AdminOverview,
  CollectionRecord,
  CollectionRequest,
  CollectionRequestStatus,
  Donation,
  DonationStatus,
  DonationWithDonor,
  DonorOverview,
  FoodCategory,
  FoodType,
  NgoOverview,
  Profile,
  QuantityUnit,
  VerificationStatus,
} from "@/types";

export interface DonationInput {
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  quantityUnit: QuantityUnit;
  foodType: FoodType;
  allergens?: string;
  imageUrl?: string;
  preparedAt: string;
  safeUntil: string;
  pickupDeadline: string;
  pickupAddress: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  additionalInstructions?: string;
}

export interface DonationFilters {
  status?: DonationStatus | "all";
  q?: string;
}

export interface ProfileInput {
  fullName: string;
  organizationName: string;
  organizationType: string;
  phone: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface RequestFilters {
  status?: CollectionRequestStatus | "all";
}

export interface DonationDetail {
  donation: DonationWithDonor;
  requests: CollectionRequest[];
}

export interface BrowseFilters {
  q?: string;
  category?: FoodCategory | "all";
  foodType?: FoodType | "all";
  city?: string | "all";
  sort?: "newest" | "deadline";
}

export interface CollectionRequestInput {
  requestedQuantity: number;
  message?: string;
}

export interface NgoDonationDetail {
  donation: DonationWithDonor;
  myRequest: CollectionRequest | null;
}

export interface DonorRepository {
  getProfile(id: string): Promise<Profile | null>;
  getDonorOverview(donorId: string): Promise<DonorOverview>;
  getPendingRequestCount(donorId: string): Promise<number>;
  listDonations(donorId: string, filters?: DonationFilters): Promise<Donation[]>;
  getDonationDetail(
    donorId: string,
    donationId: string,
  ): Promise<DonationDetail | null>;
  createDonation(donorId: string, input: DonationInput): Promise<{ id: string }>;
  listRequests(
    donorId: string,
    filters?: RequestFilters,
  ): Promise<CollectionRequest[]>;
  respondToRequest(
    donorId: string,
    requestId: string,
    action: "accept" | "reject",
  ): Promise<void>;
  markCollected(
    donorId: string,
    donationId: string,
    notes?: string,
  ): Promise<void>;
  listHistory(donorId: string): Promise<CollectionRecord[]>;
  updateProfile(userId: string, input: ProfileInput): Promise<Profile>;
}

export interface NgoRepository {
  getNgoOverview(ngoId: string): Promise<NgoOverview>;
  getPendingRequestCount(ngoId: string): Promise<number>;
  listAvailableDonations(
    ngoId: string,
    filters?: BrowseFilters,
  ): Promise<DonationWithDonor[]>;
  listAvailableCities(): Promise<string[]>;
  getDonationDetail(
    ngoId: string,
    donationId: string,
  ): Promise<NgoDonationDetail | null>;
  createRequest(
    ngoId: string,
    donationId: string,
    input: CollectionRequestInput,
  ): Promise<{ id: string }>;
  listRequests(
    ngoId: string,
    filters?: RequestFilters,
  ): Promise<CollectionRequest[]>;
  cancelRequest(ngoId: string, requestId: string): Promise<void>;
  confirmCollection(
    ngoId: string,
    donationId: string,
    notes?: string,
  ): Promise<void>;
  listCollections(ngoId: string): Promise<CollectionRecord[]>;
  updateProfile(userId: string, input: ProfileInput): Promise<Profile>;
}

export type OrganizationRoleFilter = "all" | "donor" | "ngo";
export type VerificationFilter = "all" | VerificationStatus;
export type AccountStateFilter = "all" | "active" | "disabled";

export interface AdminOrganizationFilters {
  role?: OrganizationRoleFilter;
  verification?: VerificationFilter;
  state?: AccountStateFilter;
  q?: string;
}

export interface AdminDonationFilters {
  status?: DonationStatus | "all";
  q?: string;
}

export interface AdminRepository {
  getAdminOverview(): Promise<AdminOverview>;
  getPendingVerificationCount(): Promise<number>;
  listOrganizations(
    filters?: AdminOrganizationFilters,
  ): Promise<AdminOrganization[]>;
  listDonations(filters?: AdminDonationFilters): Promise<DonationWithDonor[]>;
  setNgoVerification(
    adminId: string,
    ngoId: string,
    status: VerificationStatus,
  ): Promise<void>;
  setProfileActive(
    adminId: string,
    profileId: string,
    isActive: boolean,
  ): Promise<void>;
}
