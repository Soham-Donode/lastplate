"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowRight, HeartHandshake, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { MobileDialog } from "./mobile-dialog";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#who-its-for", label: "Who it's for" },
  { href: "#impact", label: "Impact" },
  { href: "#food-safety", label: "Food safety" },
];

const sectionWrap = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

const primarySm =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-control bg-accent-solid px-3.5 text-[13px] font-semibold text-on-accent transition duration-200 hover:bg-accent-solid-hover active:translate-y-px";

const outlineSm =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control border border-line-strong bg-paper px-4 text-sm font-medium text-ink transition duration-200 hover:bg-surface active:translate-y-px";

export function LandingHeader({
  demo,
  primaryHref,
  secondaryHref,
}: {
  demo: boolean;
  primaryHref: string;
  secondaryHref: string;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas">
        <div className={sectionWrap}>
          <div className="flex h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Logo href="/" />
              {demo && (
                <span className="hidden rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11px] font-medium text-muted sm:inline-flex">
                  Demo data
                </span>
              )}
            </div>

            <nav
              aria-label="Primary"
              className="hidden items-center gap-6 text-[13px] font-medium text-muted lg:flex"
            >
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="transition-colors duration-200 hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <ThemeToggle className="size-11 rounded-control border border-line bg-paper text-secondary hover:text-ink sm:size-9" />

              {!demo && (
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center rounded-control px-2.5 text-[13px] font-medium text-secondary transition-colors duration-200 hover:bg-surface hover:text-ink sm:h-9 sm:px-3.5"
                >
                  Sign in
                </Link>
              )}

              <Link
                href={primaryHref}
                className={cn(primarySm, "hidden sm:inline-flex")}
              >
                {demo ? "Open demo" : "Donate food"}
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </Link>

              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="landing-mobile-menu"
                className="glass-well inline-flex size-11 items-center justify-center rounded-control text-secondary transition-colors hover:text-ink sm:size-9 lg:hidden"
              >
                <Menu className="size-[18px]" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileDialog
        id="landing-mobile-menu"
        label="Site menu"
        open={open}
        desktopWidth="64rem"
        onClose={close}
        className="glass-strong inset-x-2 top-2 max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] overflow-y-auto overscroll-contain rounded-panel shadow-pop"
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <Logo href="/" onClick={close} />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="glass-well inline-flex size-11 items-center justify-center rounded-control text-secondary transition-colors hover:text-ink sm:size-9"
            >
              <X className="size-[18px]" strokeWidth={1.8} />
            </button>
          </div>

          <nav aria-label="Mobile" className="mt-4 border-t border-line pt-2">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex min-h-11 items-center rounded-control px-2 text-[14px] font-medium text-secondary transition-colors hover:bg-surface hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 grid gap-2 border-t border-line pt-4">
            {!demo && (
              <Link
                href="/login"
                onClick={close}
                className={outlineSm}
              >
                Sign in
              </Link>
            )}
            <Link
              href={primaryHref}
              onClick={close}
              className={cn(primarySm, "h-11 px-4 text-sm")}
            >
              {demo ? "Open demo" : "Donate surplus food"}
              <ArrowRight className="size-4" strokeWidth={1.8} />
            </Link>
            {!demo && (
              <Link
                href={secondaryHref}
                onClick={close}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-medium text-secondary transition-colors hover:bg-surface hover:text-ink"
              >
                <HeartHandshake className="size-4" strokeWidth={1.8} />
                Join as an NGO
              </Link>
            )}
          </div>
        </div>
      </MobileDialog>
    </>
  );
}
