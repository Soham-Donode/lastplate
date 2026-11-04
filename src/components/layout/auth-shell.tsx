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
    <main className="relative min-h-dvh bg-frame p-3 sm:p-5 lg:p-6">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-[1180px] overflow-hidden rounded-frame border border-line bg-paper shadow-pop sm:min-h-[calc(100dvh-2.5rem)] lg:min-h-[calc(100dvh-3rem)]">
        <aside className="relative hidden w-[43%] shrink-0 flex-col justify-between overflow-hidden bg-green-solid p-8 lg:flex xl:p-10">
          <Image
            src="/auth-food.jpg"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(min-width: 1024px) 43vw, 0px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-green-solid/80" aria-hidden="true" />

          <div className="relative flex items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="LastPlate home"
              className="inline-flex items-center gap-2.5 rounded-control"
            >
              <span className="flex size-10 items-center justify-center rounded-[12px] bg-white">
                <LogoMark className="size-8" />
              </span>
              <span className="text-[19px] font-semibold tracking-[-0.03em] text-white">
                LastPlate
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11.5px] font-medium text-white transition-colors hover:bg-white/15"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.8} />
              Back to website
            </Link>
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/85">
              <Leaf className="size-3" strokeWidth={2} />
              Less waste, more meals
            </span>
            <p className="mt-5 max-w-[340px] text-[32px] font-semibold leading-[1.1] tracking-[-0.045em] text-white xl:text-[38px]">
              Good food deserves a second chance.
            </p>
            <p className="mt-4 max-w-[320px] text-[13px] leading-6 text-white/75">
              LastPlate connects kitchens with verified NGOs so surplus meals
              reach people instead of bins.
            </p>
          </div>

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-1.5 w-6 rounded-full bg-white" />
              <span className="size-1.5 rounded-full bg-white/40" />
              <span className="size-1.5 rounded-full bg-white/40" />
            </div>
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-white/55">
              Built for food rescue
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-7 lg:justify-end">
            <Logo href="/" className="lg:hidden" />
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[11.5px] font-medium text-secondary transition-colors hover:bg-surface hover:text-ink lg:hidden"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.8} />
                Back
              </Link>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
            <div className="w-full max-w-[420px]">
              {children}

              <p className="mt-8 border-t border-line pt-5 text-center text-[10.5px] leading-4 text-muted">
                {footer ?? (
                  <>
                    <Link href="/" className="hover:text-ink">
                      LastPlate
                    </Link>{" "}
                    · Good food deserves a second chance.
                  </>
                )}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
