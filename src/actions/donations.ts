"use server";

import { revalidatePath } from "next/cache";
import { requireDonor, requireProfile } from "@/lib/auth";
import { getDonorRepository } from "@/lib/data";
import { zonedDateTimeToIso } from "@/lib/utils";
import {
  donationFormSchema,
  profileSchema,
  type DonationFormValues,
  type ProfileFormValues,
} from "@/lib/validations";

export type FieldErrors = Record<string, string[] | undefined>;

export type MutationResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export type CreateDonationResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

function revalidateDonorSurfaces(donationId?: string) {
  revalidatePath("/donor/dashboard");
  revalidatePath("/donor/donations");
  revalidatePath("/donor/requests");
  revalidatePath("/donor/history");
  if (donationId) revalidatePath(`/donor/donations/${donationId}`);
}

export async function createDonationAction(
  values: DonationFormValues,
): Promise<CreateDonationResult> {
  const profile = await requireDonor();
  const parsed = donationFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields before publishing.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  try {
    const result = await getDonorRepository().createDonation(profile.id, {
      title: input.title,
      description: input.description,
      category: input.category,
      quantity: input.quantity,
      quantityUnit: input.quantityUnit,
      foodType: input.foodType,
      allergens: input.allergens,
      imageUrl: input.imageUrl,
      preparedAt: zonedDateTimeToIso(input.preparedAt),
      safeUntil: zonedDateTimeToIso(input.safeUntil),
      pickupDeadline: zonedDateTimeToIso(input.pickupDeadline),
      pickupAddress: input.pickupAddress,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      additionalInstructions: input.additionalInstructions,
    });

    revalidateDonorSurfaces(result.id);
    return { ok: true, id: result.id };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We could not publish this donation. Please try again.",
    };
  }
}

export async function respondToRequestAction(
  requestId: string,
  action: "accept" | "reject",
): Promise<MutationResult> {
  const profile = await requireDonor();

  try {
    await getDonorRepository().respondToRequest(profile.id, requestId, action);
    revalidateDonorSurfaces();
    return {
      ok: true,
      message:
        action === "accept"
          ? "Request accepted. The NGO has been assigned this donation."
          : "Request declined.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We could not update this request. Please try again.",
    };
  }
}

export async function markCollectedAction(
  donationId: string,
  notes?: string,
): Promise<MutationResult> {
  const profile = await requireDonor();

  try {
    await getDonorRepository().markCollected(profile.id, donationId, notes);
    revalidateDonorSurfaces(donationId);
    return { ok: true, message: "Collection recorded." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We could not record this collection. Please try again.",
    };
  }
}

export async function updateProfileAction(
  values: ProfileFormValues,
): Promise<MutationResult> {
  const profile = await requireProfile();
  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await getDonorRepository().updateProfile(profile.id, parsed.data);
    revalidatePath("/donor/settings");
    revalidatePath("/donor/dashboard");
    revalidatePath("/ngo/settings");
    revalidatePath("/ngo/dashboard");
    revalidatePath("/admin/settings");
    return { ok: true, message: "Organization profile updated." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We could not save your profile. Please try again.",
    };
  }
}
