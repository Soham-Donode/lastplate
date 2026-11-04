import { NextResponse } from "next/server";
import { ROLE_HOME } from "@/lib/constants";
import { isDemoMode } from "@/lib/supabase/config";
import { DEMO_ROLE_COOKIE, parseDemoRole } from "@/lib/demo/session";

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!isDemoMode) {
    return NextResponse.redirect(new URL("/login", url));
  }

  const role = parseDemoRole(url.searchParams.get("role") ?? undefined);
  const response = NextResponse.redirect(new URL(ROLE_HOME[role], url));

  response.cookies.set(DEMO_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
