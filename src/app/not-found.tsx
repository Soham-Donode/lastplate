import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="app-ambient flex min-h-dvh items-center justify-center p-4 sm:p-6">
      <div className="glass-window glass-sheen w-full max-w-lg rounded-[28px] p-8 text-center sm:p-10">
        <Logo href="/" className="justify-center" />

        <span className="glass-well mx-auto mt-8 flex size-14 items-center justify-center rounded-full text-muted">
          <UtensilsCrossed className="size-6" strokeWidth={1.7} />
        </span>

        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-muted">
          404
        </p>
        <h1 className="mt-2 text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink">
          This plate is empty.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-muted">
          We couldn&apos;t find the page you were looking for. It may have moved,
          or the link may be out of date.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link href="/" className={buttonStyles()}>
            <ArrowLeft className="size-4" strokeWidth={1.8} />
            Back to LastPlate
          </Link>
          <Link
            href="/login"
            className={buttonStyles({ variant: "secondary" })}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
