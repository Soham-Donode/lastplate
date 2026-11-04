import type {
  CollectionRecord,
  CollectionRequest,
  CollectionRequestStatus,
  Donation,
  DonationStatus,
  FoodCategory,
  FoodType,
  Profile,
  PublicProfile,
  QuantityUnit,
  UserRole,
  VerificationStatus,
} from "@/types";

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization_name: string;
  organization_type: string;
  phone: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  verification_status: string;
  registration_number: string | null;
  verification_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicProfileRow {
  id: string;
  organization_name: string;
  organization_type: string;
  city: string;
  role: string;
  verification_status: string;
}

export interface DonationRow {
  id: string;
  donor_id: string;
  title: string;
  description: string;
  category: string;
  quantity: number | string;
  quantity_unit: string;
  food_type: string;
  allergens: string | null;
  image_url: string | null;
  prepared_at: string;
  safe_until: string;
  pickup_deadline: string;
  pickup_address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  additional_instructions: string | null;
  status: string;
  assigned_ngo_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionRequestRow {
  id: string;
  donation_id: string;
  ngo_id: string;
  requested_quantity: number | string;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionRecordRow {
  id: string;
  donation_id: string;
  ngo_id: string;
  donor_id: string;
  collected_quantity: number | string;
  collected_at: string;
  notes: string | null;
}

const roles = new Set<UserRole>(["donor", "ngo", "admin"]);
const donationStatuses = new Set<DonationStatus>([
  "available",
  "assigned",
  "collected",
  "expired",
  "cancelled",
]);
const requestStatuses = new Set<CollectionRequestStatus>([
  "pending",
  "accepted",
  "rejected",
  "cancelled",
  "completed",
]);
const verificationStatuses = new Set<VerificationStatus>([
  "pending",
  "verified",
  "rejected",
]);
const foodTypes = new Set<FoodType>(["vegetarian", "non_vegetarian"]);
const categories = new Set<FoodCategory>([
  "cooked_meals",
  "rice_grains",
  "bread_bakery",
  "fruits",
  "vegetables",
  "packaged_food",
  "other",
]);
const units = new Set<QuantityUnit>(["kg", "meals", "packs", "litres"]);

function pick<T extends string>(allowed: Set<T>, value: string, fallback: T): T {
  return allowed.has(value as T) ? (value as T) : fallback;
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: pick(roles, row.role, "donor"),
    organizationName: row.organization_name,
    organizationType: row.organization_type,
    phone: row.phone,
    city: row.city,
    address: row.address,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    verificationStatus: pick(
      verificationStatuses,
      row.verification_status,
      "pending",
    ),
    registrationNumber: row.registration_number ?? null,
    verificationNotes: row.verification_notes ?? null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPublicProfile(row: PublicProfileRow): PublicProfile {
  return {
    id: row.id,
    organizationName: row.organization_name,
    organizationType: row.organization_type,
    city: row.city,
    role: pick(roles, row.role, "ngo"),
    verificationStatus: pick(
      verificationStatuses,
      row.verification_status,
      "pending",
    ),
  };
}

export function mapDonation(row: DonationRow): Donation {
  return {
    id: row.id,
    donorId: row.donor_id,
    title: row.title,
    description: row.description,
    category: pick(categories, row.category, "other"),
    quantity: Number(row.quantity),
    quantityUnit: pick(units, row.quantity_unit, "kg"),
    foodType: pick(foodTypes, row.food_type, "vegetarian"),
    allergens: row.allergens,
    imageUrl: row.image_url,
    preparedAt: row.prepared_at,
    safeUntil: row.safe_until,
    pickupDeadline: row.pickup_deadline,
    pickupAddress: row.pickup_address,
    city: row.city,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    additionalInstructions: row.additional_instructions,
    status: pick(donationStatuses, row.status, "available"),
    assignedNgoId: row.assigned_ngo_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapRequest(
  row: CollectionRequestRow,
  donation: Donation | undefined,
  ngo: PublicProfile | undefined,
): CollectionRequest {
  return {
    id: row.id,
    donationId: row.donation_id,
    ngoId: row.ngo_id,
    requestedQuantity: Number(row.requested_quantity),
    message: row.message,
    status: pick(requestStatuses, row.status, "pending"),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
    ngo: ngo
      ? {
          id: ngo.id,
          organizationName: ngo.organizationName,
          city: ngo.city,
        }
      : null,
  };
}

export function mapRecord(
  row: CollectionRecordRow,
  donation: Donation | undefined,
  ngo: PublicProfile | undefined,
): CollectionRecord {
  return {
    id: row.id,
    donationId: row.donation_id,
    ngoId: row.ngo_id,
    donorId: row.donor_id,
    collectedQuantity: Number(row.collected_quantity),
    quantityUnit: donation?.quantityUnit ?? "kg",
    collectedAt: row.collected_at,
    notes: row.notes,
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
}
