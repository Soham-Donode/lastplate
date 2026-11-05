import Link from "next/link";
import { redirect } from "next/navigation";
import { Leaf, ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";
import { isDemoMode } from "@/lib/supabase/config";
import { buttonStyles } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = {
  title: "Create an account",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const profile = await getCurrentProfile();

  if (profile && !isDemoMode) {
    redirect(ROLE_HOME[profile.role]);
  }

  const { role } = await searchParams;
  const defaultRole = role === "ngo" ? "ngo" : "donor";

  return (
    <AuthShell>
      {isDemoMode ? (
        <div>
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
            <Leaf className="size-5" strokeWidth={1.8} />
          </span>
          <h1 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[34px]">
            Registration is off in demo mode
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            The local demo workspace uses seeded accounts instead of real
            sign-up. Add your Supabase URL and public key to{" "}
            <code className="rounded-xs bg-surface px-1 py-0.5 text-[10px] text-secondary">
              .env.local
            </code>{" "}
            to create donor and NGO accounts with email confirmation.
          </p>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-muted">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-accent-ink"
              strokeWidth={2}
            />
            NGO accounts are reviewed by an administrator before they can
            request collections.
          </p>
          <div className="mt-5 grid gap-2">
            <Link href="/login" className={buttonStyles({ className: "h-12 w-full rounded-[10px] text-[14px]" })}>
              Open the demo workspace
            </Link>
            <Link
              href="/"
              className={buttonStyles({
                variant: "secondary",
                className: "h-12 w-full rounded-[10px] text-[14px]",
              })}
            >
              Back to home
            </Link>
          </div>
        </div>
      ) : (
        <RegisterForm defaultRole={defaultRole} />
      )}
    </AuthShell>
  );
}
