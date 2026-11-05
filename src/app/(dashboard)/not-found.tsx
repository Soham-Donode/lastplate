import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";

export default async function DashboardNotFound() {
  const profile = await getCurrentProfile();
  const home = profile ? ROLE_HOME[profile.role] : "/";

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10">
      <Card className="w-full max-w-lg p-8 text-center sm:p-10">
        <span className="glass-well mx-auto flex size-14 items-center justify-center rounded-full text-muted">
          <UtensilsCrossed className="size-6" strokeWidth={1.7} />
        </span>

        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-muted">
          404
        </p>
        <h1 className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink">
          This page isn&apos;t on the menu.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-muted">
          The listing may have expired, been collected, or been removed. It is
          no longer available in this workspace.
        </p>

        <Link href={home} className={buttonStyles({ className: "mt-6" })}>
          <ArrowLeft className="size-4" strokeWidth={1.8} />
          Back to dashboard
        </Link>
      </Card>
    </div>
  );
}
