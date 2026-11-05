import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AuthShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="app-ambient relative min-h-dvh p-2.5 sm:p-4 lg:p-6">
      <div className="glass-window mx-auto flex min-h-[calc(100dvh-1.25rem)] w-full max-w-[1180px] overflow-hidden rounded-[24px] sm:min-h-[calc(100dvh-2rem)] sm:rounded-[28px] lg:min-h-[calc(100dvh-3rem)] lg:rounded-[32px]">
        <aside className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden border-r border-line bg-[#0d1418] p-8 lg:flex xl:p-10">
          <Image
            src="/auth-food.jpg"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(min-width: 1024px) 44vw, 0px"
            className="scale-105 object-cover grayscale"
          />
          <div
            className="absolute inset-0 bg-[#0b1116]/72"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="LastPlate home"
              className="inline-flex items-center gap-2.5 rounded-control"
            >
              <LogoMark className="size-8" />
              <span className="text-[19px] font-semibold tracking-[-0.035em] text-white">
                LastPlate
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-[11.5px] font-medium text-white transition-colors duration-200 hover:bg-white/10"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.8} />
              Back to website
            </Link>
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/85">
              <Leaf className="size-3" strokeWidth={2} />
              Less waste, more meals
            </span>
            <p className="mt-5 max-w-[340px] text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-white xl:text-[38px]">
              Good food deserves a second chance.
            </p>
            <p className="mt-4 max-w-[320px] text-[13px] leading-6 text-white/75">
              LastPlate connects kitchens with verified NGOs so surplus meals
              reach people instead of bins.
            </p>
          </div>

          <div className="relative flex items-center justify-between gap-4 rounded-[16px] border border-white/20 px-4 py-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-1.5 w-6 rounded-full bg-accent" />
              <span className="size-1.5 rounded-full bg-white/40" />
              <span className="size-1.5 rounded-full bg-white/40" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">
              Built for food rescue
            </p>
          </div>
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col bg-paper">
          <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-7 lg:justify-end">
            <Logo href="/" className="lg:hidden" />
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="glass-well inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium text-secondary transition-colors hover:text-ink lg:hidden"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.8} />
                Back
              </Link>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
            <div className="w-full max-w-[420px]">{children}</div>
          </div>

          <p className="mx-8 mb-5 border-t border-line pt-5 text-center text-[10.5px] leading-4 text-muted">
            {footer ?? (
              <>
                <Link href="/" className="transition-colors hover:text-ink">
                  LastPlate
                </Link>{" "}
                · Good food deserves a second chance.
              </>
            )}
          </p>
        </section>
      </div>
    </main>
  );
}
