import type {
  CollectionRequestStatus,
  DonationStatus,
  FoodCategory,
  FoodType,
  QuantityUnit,
  UserRole,
} from "@/types";

export const FOOD_CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: "cooked_meals", label: "Cooked meals" },
  { value: "rice_grains", label: "Rice & grains" },
  { value: "bread_bakery", label: "Bread & bakery" },
  { value: "fruits", label: "Fruits" },
  { value: "vegetables", label: "Vegetables" },
  { value: "packaged_food", label: "Packaged food" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  cooked_meals: "Cooked meals",
  rice_grains: "Rice & grains",
  bread_bakery: "Bread & bakery",
  fruits: "Fruits",
  vegetables: "Vegetables",
  packaged_food: "Packaged food",
  other: "Other",
};

export const QUANTITY_UNITS: { value: QuantityUnit; label: string }[] = [
  { value: "kg", label: "Kilograms" },
  { value: "meals", label: "Meals" },
  { value: "packs", label: "Packs" },
  { value: "litres", label: "Litres" },
];

export const UNIT_SHORT: Record<QuantityUnit, string> = {
  kg: "kg",
  meals: "meals",
  packs: "packs",
  litres: "L",
};

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  vegetarian: "Vegetarian",
  non_vegetarian: "Non-vegetarian",
};

export const DONATION_STATUS_LABELS: Record<DonationStatus, string> = {
  available: "Available",
  assigned: "Assigned",
  collected: "Collected",
  expired: "Expired",
  cancelled: "Cancelled",
};

export const REQUEST_STATUS_LABELS: Record<CollectionRequestStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  donor: "Food donor",
  ngo: "NGO",
  admin: "Administrator",
};

export const ROLE_HOME: Record<UserRole, string> = {
  donor: "/donor/dashboard",
  ngo: "/ngo/dashboard",
  admin: "/admin/dashboard",
};

export const DONOR_ORGANIZATION_TYPES = [
  "Restaurant",
  "Cafeteria",
  "Hotel",
  "College hostel",
  "College mess",
  "Bakery",
  "Cloud kitchen",
  "Other food establishment",
] as const;

export const NGO_ORGANIZATION_TYPES = [
  "Food rescue NGO",
  "Community kitchen",
  "Shelter",
  "Charitable trust",
  "Foundation",
  "Other non-profit",
] as const;

export function organizationTypesForRole(role: "donor" | "ngo") {
  return role === "ngo" ? NGO_ORGANIZATION_TYPES : DONOR_ORGANIZATION_TYPES;
}

export const DONATION_STATUS_FILTERS: {
  value: DonationStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "collected", label: "Collected" },
  { value: "expired", label: "Expired" },
];
