export type UserRole = "donor" | "ngo" | "admin";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type DonationStatus =
  | "available"
  | "assigned"
  | "collected"
  | "expired"
  | "cancelled";

export type CollectionRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export type FoodType = "vegetarian" | "non_vegetarian";

export type FoodCategory =
  | "cooked_meals"
  | "rice_grains"
  | "bread_bakery"
  | "fruits"
  | "vegetables"
  | "packaged_food"
  | "other";

export type QuantityUnit = "kg" | "meals" | "packs" | "litres";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  organizationName: string;
  organizationType: string;
  phone: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  verificationStatus: VerificationStatus;
  registrationNumber: string | null;
  verificationNotes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** The subset of a profile that other organizations are allowed to see. */
export type PublicProfile = Pick<
  Profile,
  | "id"
  | "organizationName"
  | "organizationType"
  | "city"
  | "role"
  | "verificationStatus"
>;

export interface Donation {
  id: string;
  donorId: string;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  quantityUnit: QuantityUnit;
  foodType: FoodType;
  allergens: string | null;
  imageUrl: string | null;
  preparedAt: string;
  safeUntil: string;
  pickupDeadline: string;
  pickupAddress: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  additionalInstructions: string | null;
  status: DonationStatus;
  assignedNgoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DonationWithDonor extends Donation {
  donor: Pick<Profile, "id" | "organizationName" | "city"> | null;
  assignedNgo: Pick<Profile, "id" | "organizationName"> | null;
}

export interface CollectionRequest {
  id: string;
  donationId: string;
  ngoId: string;
  requestedQuantity: number;
  message: string | null;
  status: CollectionRequestStatus;
  createdAt: string;
  updatedAt: string;
  donation: Pick<
    Donation,
    "id" | "title" | "quantity" | "quantityUnit" | "status" | "pickupDeadline"
  > | null;
  ngo: Pick<Profile, "id" | "organizationName" | "city"> | null;
}

export interface CollectionRecord {
  id: string;
  donationId: string;
  ngoId: string;
  donorId: string;
  collectedQuantity: number;
  quantityUnit: QuantityUnit;
  collectedAt: string;
  notes: string | null;
  donation: Pick<
    Donation,
    "id" | "title" | "category" | "quantityUnit"
  > | null;
  ngo: Pick<Profile, "id" | "organizationName"> | null;
}

export interface DonationStatusCounts {
  available: number;
  assigned: number;
  collected: number;
  expired: number;
  cancelled: number;
}

export interface ActivityPoint {
  date: string;
  label: string;
  count: number;
}

export interface DonorOverview {
  totalDonations: number;
  activeDonations: number;
  pendingRequests: number;
  collectionsCompleted: number;
  foodRescued: number;
  recentDonations: Donation[];
  upcomingDeadlines: Donation[];
  recentRequests: CollectionRequest[];
  activity: ActivityPoint[];
  statusCounts: DonationStatusCounts;
}

export type CollectionRequestCounts = Record<CollectionRequestStatus, number>;

export interface NgoOverview {
  availableDonations: number;
  pendingRequests: number;
  acceptedRequests: number;
  completedCollections: number;
  foodCollected: number;
  recentRequests: CollectionRequest[];
  upcomingPickups: DonationWithDonor[];
  nearbyDonations: DonationWithDonor[];
  mapDonations: DonationWithDonor[];
  activity: ActivityPoint[];
  requestCounts: CollectionRequestCounts;
}

export interface AdminOrganization {
  profile: Profile;
  donationsPublished: number;
  collectionsCompleted: number;
}

export interface AdminOverview {
  totalOrganizations: number;
  donors: number;
  ngos: number;
  pendingVerification: number;
  activeAccounts: number;
  disabledAccounts: number;
  activeDonations: number;
  completedCollections: number;
  foodRescued: number;
  pendingNgos: Profile[];
  recentDonations: DonationWithDonor[];
  recentCollections: CollectionRecord[];
  activity: ActivityPoint[];
}
