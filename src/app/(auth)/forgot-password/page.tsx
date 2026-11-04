import Link from "next/link";
import { redirect } from "next/navigation";
import { Leaf } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";
import { isDemoMode } from "@/lib/supabase/config";
import { buttonStyles } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata = {
  title: "Reset your password",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const profile = await getCurrentProfile();

  if (profile && !isDemoMode) {
    redirect(ROLE_HOME[profile.role]);
  }

  return (
    <AuthShell>
      {isDemoMode ? (
        <div>
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-green-light text-green-dark">
            <Leaf className="size-5" strokeWidth={1.8} />
          </span>
          <h1 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[34px]">
            Password reset is off in demo mode
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            The demo workspace does not send email. Add your Supabase project
            credentials to <code className="rounded-xs bg-surface px-1 py-0.5 text-[10px] text-secondary">.env.local</code>{" "}
            to enable password reset emails.
          </p>
          <Link
            href="/login"
            className={buttonStyles({ className: "mt-5 h-12 w-full rounded-[10px] text-[14px]" })}
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <ForgotPasswordForm
          notice={
            (await searchParams).expired
              ? "That reset link has expired or was already used. Request a new one below."
              : undefined
          }
        />
      )}
    </AuthShell>
  );
}
