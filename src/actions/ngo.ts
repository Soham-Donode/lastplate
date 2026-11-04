"use server";

import { revalidatePath } from "next/cache";
import { requireNgo } from "@/lib/auth";
import { getNgoRepository } from "@/lib/data";
import {
  collectionRequestSchema,
  type CollectionRequestFormValues,
} from "@/lib/validations";

export type NgoMutationResult =
  | { ok: true; message?: string; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function revalidateNgoSurfaces(donationId?: string) {
  revalidatePath("/ngo/dashboard");
  revalidatePath("/ngo/explore");
  revalidatePath("/ngo/requests");
  revalidatePath("/ngo/collections");
  if (donationId) revalidatePath(`/ngo/donations/${donationId}`);

  // A new request or collection also changes the donor's workspace.
  revalidatePath("/donor/dashboard");
  revalidatePath("/donor/donations");
  revalidatePath("/donor/requests");
  revalidatePath("/donor/history");
}

export async function createCollectionRequestAction(
  values: CollectionRequestFormValues,
): Promise<NgoMutationResult> {
  const profile = await requireNgo();
  const parsed = collectionRequestSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the request details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await getNgoRepository().createRequest(
      profile.id,
      parsed.data.donationId,
      {
        requestedQuantity: parsed.data.requestedQuantity,
        message: parsed.data.message,
      },
    );

    revalidateNgoSurfaces(parsed.data.donationId);
    return {
      ok: true,
      id: result.id,
      message: "Request sent. The donor will review it shortly.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We could not send this request. Please try again.",
    };
  }
}

export async function cancelCollectionRequestAction(
  requestId: string,
): Promise<NgoMutationResult> {
  const profile = await requireNgo();

  try {
    await getNgoRepository().cancelRequest(profile.id, requestId);
    revalidateNgoSurfaces();
    return { ok: true, message: "Request cancelled." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We could not cancel this request. Please try again.",
    };
  }
}

export async function confirmCollectionAction(
  donationId: string,
  notes?: string,
): Promise<NgoMutationResult> {
  const profile = await requireNgo();

  try {
    await getNgoRepository().confirmCollection(profile.id, donationId, notes);
    revalidateNgoSurfaces(donationId);
    return { ok: true, message: "Collection confirmed." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We could not confirm this collection. Please try again.",
    };
  }
}
