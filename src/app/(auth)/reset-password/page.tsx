import Link from "next/link";
import { redirect } from "next/navigation";
import { Leaf } from "lucide-react";
import { isDemoMode } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buttonStyles } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const metadata = {
  title: "Choose a new password",
};

export default async function ResetPasswordPage() {
  if (isDemoMode) {
    return (
      <AuthShell>
        <div>
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-green-light text-green-dark">
            <Leaf className="size-5" strokeWidth={1.8} />
          </span>
          <h1 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[34px]">
            Password reset is off in demo mode
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            Add your Supabase project credentials to{" "}
            <code className="rounded-xs bg-surface px-1 py-0.5 text-[10px] text-secondary">
              .env.local
            </code>{" "}
            to enable password reset emails.
          </p>
          <Link
            href="/login"
            className={buttonStyles({ className: "mt-5 h-12 w-full rounded-[10px] text-[14px]" })}
          >
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/forgot-password?expired=1");
  }

  return (
    <AuthShell>
      <ResetPasswordForm email={user.email} />
    </AuthShell>
  );
}
