"use server";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { requireDonor } from "@/lib/auth";
import { isDemoMode } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

  const extension = EXTENSIONS[file.type];
  if (!extension) {
    return { ok: false, message: "Use a JPG, PNG or WebP image." };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Images must be smaller than 5 MB." };
  }

  const filename = `${randomUUID()}.${extension}`;

  if (isDemoMode) {
    try {
      const uploads = path.join(process.cwd(), ".data", "uploads");
      await fs.mkdir(uploads, { recursive: true });
      await fs.writeFile(
        path.join(uploads, filename),
        Buffer.from(await file.arrayBuffer()),
      );
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
