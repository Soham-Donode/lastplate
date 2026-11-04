"use server";

import { revalidatePath } from "next/cache";
import type { VerificationStatus } from "@/types";
import { requireAdmin } from "@/lib/auth";
import { getAdminRepository } from "@/lib/data";
import {
  ngoVerificationSchema,
  profileActiveSchema,
} from "@/lib/validations";

export type AdminMutationResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function revalidateAdminSurfaces() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/users");
  revalidatePath("/admin/donations");
  revalidatePath("/login");
}

function revalidateMarketplaceSurfaces() {
  revalidatePath("/donor/dashboard");
  revalidatePath("/donor/donations");
  revalidatePath("/donor/requests");
  revalidatePath("/ngo/dashboard");
  revalidatePath("/ngo/explore");
  revalidatePath("/ngo/requests");
}

export async function setNgoVerificationAction(
  ngoId: string,
  status: VerificationStatus,
): Promise<AdminMutationResult> {
  const profile = await requireAdmin();
  const parsed = ngoVerificationSchema.safeParse({ ngoId, status });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the verification details and try again.",
    };
  }

  try {
    await getAdminRepository().setNgoVerification(
      profile.id,
      parsed.data.ngoId,
      parsed.data.status,
    );
    revalidateAdminSurfaces();
    revalidateMarketplaceSurfaces();

    return {
      ok: true,
      message:
        parsed.data.status === "verified"
          ? "NGO verified. It can now request collections."
          : parsed.data.status === "rejected"
            ? "NGO verification rejected. Pending requests were closed."
            : "NGO returned to the verification queue.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We could not update this NGO. Please try again.",
    };
  }
}

export async function setProfileActiveAction(
  profileId: string,
  isActive: boolean,
): Promise<AdminMutationResult> {
  const profile = await requireAdmin();
  const parsed = profileActiveSchema.safeParse({ profileId, isActive });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the account details and try again.",
    };
  }

  try {
    await getAdminRepository().setProfileActive(
      profile.id,
      parsed.data.profileId,
      parsed.data.isActive,
    );
    revalidateAdminSurfaces();
    revalidateMarketplaceSurfaces();

    return {
      ok: true,
      message: parsed.data.isActive
        ? "Account enabled. The organization can sign in again."
        : "Account disabled. Pending requests were closed.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We could not update this account. Please try again.",
    };
  }
}
