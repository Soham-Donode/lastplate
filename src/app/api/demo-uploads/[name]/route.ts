import { NextResponse } from "next/server";
import { readDemoUpload } from "@/lib/demo/uploads";
import { isDemoMode } from "@/lib/supabase/config";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  if (!isDemoMode || !/^[a-f0-9-]+\.(jpg|jpeg|png|webp)$/i.test(name)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[extension];

  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readDemoUpload(name);

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
