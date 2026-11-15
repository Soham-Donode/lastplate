"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import type { Profile } from "@/types";
import { navigationForRole } from "@/lib/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function SearchField({
  action,
  placeholder,
}: {
  action: string;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      const input = inputRef.current;
      if (
        event.key === "/" &&
        !isTyping &&
        input?.offsetWidth &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        input.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form
      action={action}
      method="get"
      role="search"
      className="relative hidden w-full max-w-[420px] sm:block"
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        strokeWidth={1.8}
      />
      <input
        ref={inputRef}
        type="search"
        name="q"
        placeholder={placeholder}
        aria-label={placeholder}
        className="glass-well h-10 w-full rounded-full pl-9 pr-12 text-[13px] text-ink placeholder:text-muted transition-[border-color,box-shadow,background-color] duration-200 focus:border-accent-ink/60 focus:bg-paper focus:outline-none focus:ring-[3px] focus:ring-accent/40 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <kbd className="glass-well pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full px-2 py-0.5 font-sans text-[10px] leading-4 text-muted md:inline-flex">
        /
      </kbd>
    </form>
  );
}

export function Topbar({
  profile,
  pendingRequests,
  demo,
  navOpen,
  onMenu,
}: {
  profile: Profile;
  pendingRequests: number;
  demo: boolean;
  navOpen: boolean;
  onMenu: () => void;
}) {
  const navigation = navigationForRole(profile.role);
  const isNgo = profile.role === "ngo";
  const isAdmin = profile.role === "admin";
  const searchHref = isNgo
    ? "/ngo/explore"
    : isAdmin
      ? "/admin/donations"
      : "/donor/donations";
  const requestsHref = isNgo
    ? "/ngo/requests"
    : isAdmin
      ? "/admin/users?verification=pending"
      : "/donor/requests";
  const settingsHref = isNgo
    ? "/ngo/settings"
    : isAdmin
      ? "/admin/settings"
      : "/donor/settings";

  return (
    <header className="sticky top-0 z-30 sm:px-5 sm:pt-3 lg:px-6">
      <div className="glass-surface glass-sheen flex h-[62px] items-center gap-1 px-2 max-sm:rounded-none max-sm:border-x-0 max-sm:border-t-0 sm:gap-3 sm:rounded-[20px] sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 sm:size-10 lg:hidden"
          onClick={onMenu}
          aria-label="Open navigation"
          aria-controls="dashboard-navigation"
          aria-expanded={navOpen}
        >
          <Menu className="size-5" strokeWidth={1.8} />
        </Button>

        <Link
          href={navigation.home}
          className="flex h-11 min-w-0 items-center gap-1.5 whitespace-nowrap sm:gap-2 lg:hidden"
          aria-label="LastPlate dashboard"
        >
          <LogoMark className="hidden size-[30px] shrink-0 min-[375px]:block" />
          <span className="text-[15px] font-semibold tracking-[-0.03em] text-ink">
            LastPlate
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 sm:block">
          <SearchField
            action={searchHref}
            placeholder={isNgo ? "Search available food" : "Search donations"}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
          {demo && (
            <span
              title="This workspace uses local demo data. Add Supabase credentials to use your own database."
              className="glass-well hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] text-muted md:inline-flex"
            >
              <span
                className="size-1.5 rounded-full bg-accent-ink"
                aria-hidden="true"
              />
              Demo data
            </span>
          )}

          <Link
            href={searchHref}
            aria-label="Search donations"
            className="glass-well inline-flex size-11 items-center justify-center rounded-full text-secondary transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-px hover:text-ink sm:hidden"
          >
            <Search className="size-[18px]" strokeWidth={1.8} />
          </Link>

          <ThemeToggle className="size-11 sm:size-10" />

          <Link
            href={requestsHref}
            aria-label={
              pendingRequests > 0
                ? isAdmin
                  ? `NGO verifications, ${pendingRequests} pending`
                  : `Collection requests, ${pendingRequests} pending`
                : isAdmin
                  ? "NGO verifications"
                  : "Collection requests"
            }
            className="glass-well relative inline-flex size-11 items-center justify-center rounded-full text-secondary sm:size-10 transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-px hover:text-ink"
          >
            <Bell className="size-[18px]" strokeWidth={1.8} />
            {pendingRequests > 0 && (
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-accent-ink shadow-[0_0_0_2.5px_var(--color-paper)]" />
            )}
          </Link>

          <Link
            href={settingsHref}
            aria-label="Organization settings"
            className="flex h-11 min-w-11 items-center justify-center gap-2.5 rounded-[14px] border border-transparent px-1 transition-all duration-200 hover:border-line hover:bg-surface md:pr-2.5"
          >
            <Avatar name={profile.organizationName} tone="accent" />
            <span className="hidden text-left md:block">
              <span className="block max-w-[180px] truncate text-[12.5px] font-medium leading-4 text-ink">
                {profile.organizationName}
              </span>
              <span className="block max-w-[180px] truncate text-[11px] leading-4 text-muted">
                {profile.email}
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
