"use server";

import { randomUUID } from "node:crypto";
import { requireDonor } from "@/lib/auth";
import { DONATION_IMAGE_MAX_BYTES, DONATION_IMAGE_MAX_MB } from "@/lib/constants";
import { isDemoMode } from "@/lib/data";
import { saveDemoUpload } from "@/lib/demo/uploads";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EXTENSIONS = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function uploadDonationImageAction(
  formData: FormData,
): Promise<UploadResult> {
  const profile = await requireDonor();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose an image to upload." };
  }

  const extension = EXTENSIONS.get(file.type);
  if (!extension) {
    return { ok: false, message: "Use a JPG, PNG or WebP image." };
  }

  if (file.size > DONATION_IMAGE_MAX_BYTES) {
    return { ok: false, message: `Images must be ${DONATION_IMAGE_MAX_MB} MB or smaller.` };
  }

  const filename = `${randomUUID()}.${extension}`;

  if (isDemoMode) {
    try {
      await saveDemoUpload(filename, new Uint8Array(await file.arrayBuffer()));
      return { ok: true, url: `/api/demo-uploads/${filename}` };
    } catch {
      return { ok: false, message: "The image could not be saved." };
    }
  }

  const supabase = await createSupabaseServerClient();
  const objectPath = `${profile.id}/${filename}`;
  const { error } = await supabase.storage
    .from("donation-images")
    .upload(objectPath, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    return { ok: false, message: "The image could not be uploaded." };
  }

  const { data } = supabase.storage
    .from("donation-images")
    .getPublicUrl(objectPath);

  return { ok: true, url: data.publicUrl };
}
