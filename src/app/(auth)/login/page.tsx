import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Leaf, ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";
import { isDemoMode } from "@/lib/supabase/config";
import { buttonStyles } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getCurrentProfile();

  if (profile && !isDemoMode) {
    redirect(ROLE_HOME[profile.role]);
  }

  const { error } = await searchParams;

  return (
    <AuthShell>
      {isDemoMode ? (
        <div>
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
            <Leaf className="size-5" strokeWidth={1.8} />
          </span>
          <h1 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[34px]">
            Demo workspace
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            Supabase credentials are not configured, so LastPlate is running
            against a local demo workspace with sample donations and NGO
            requests.
          </p>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-muted">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-accent-ink"
              strokeWidth={2}
            />
            Add your Supabase URL and public key to{" "}
            <code className="rounded-xs bg-surface px-1 py-0.5 text-[10px] text-secondary">
              .env.local
            </code>{" "}
            to enable real authentication and registration.
          </p>
          <div className="mt-5 grid gap-2">
            <Link
              href="/api/demo-role?role=donor"
              className={buttonStyles({ className: "h-12 w-full rounded-[10px] text-[14px]" })}
            >
              Open donor dashboard
              <ArrowRight className="size-4" strokeWidth={1.8} />
            </Link>
            <Link
              href="/api/demo-role?role=ngo"
              className={buttonStyles({
                variant: "secondary",
                className: "h-12 w-full rounded-[10px] text-[14px]",
              })}
            >
              Open NGO dashboard
              <ArrowRight className="size-4" strokeWidth={1.8} />
            </Link>
            <Link
              href="/api/demo-role?role=admin"
              className={buttonStyles({
                variant: "ghost",
                className: "h-12 w-full rounded-[10px] text-[14px]",
              })}
            >
              Open admin workspace
              <ArrowRight className="size-4" strokeWidth={1.8} />
            </Link>
          </div>
          <p className="mt-3 text-center text-[10.5px] leading-4 text-muted">
            You can switch between the donor, NGO, and admin views at any time
            from the sidebar.
          </p>
        </div>
      ) : (
        <LoginForm initialError={error} />
      )}
    </AuthShell>
  );
}
