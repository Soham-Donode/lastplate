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

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
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
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        strokeWidth={1.8}
      />
      <input
        ref={inputRef}
        type="search"
        name="q"
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-control border border-line bg-paper pl-9 pr-12 text-[13px] text-ink placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/15 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-xs border border-line bg-canvas px-1.5 py-0.5 font-sans text-[10px] leading-4 text-muted md:inline-flex">
        /
      </kbd>
    </form>
  );
}

export function Topbar({
  profile,
  pendingRequests,
  demo,
  onMenu,
}: {
  profile: Profile;
  pendingRequests: number;
  demo: boolean;
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
    <header className="flex h-[72px] shrink-0 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" strokeWidth={1.8} />
      </Button>

      <Link
        href={navigation.home}
        className="flex items-center gap-2 lg:hidden"
        aria-label="LastPlate dashboard"
      >
        <LogoMark className="size-[30px]" />
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

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {demo && (
          <span
            title="This workspace uses local demo data. Add Supabase credentials to use your own database."
            className="hidden items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] text-muted md:inline-flex"
          >
            <span className="size-1.5 rounded-full bg-green" aria-hidden="true" />
            Demo data
          </span>
        )}

        <Link
          href={searchHref}
          aria-label="Search donations"
          className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-paper text-secondary transition-colors hover:bg-surface hover:text-ink sm:hidden"
        >
          <Search className="size-[18px]" strokeWidth={1.8} />
        </Link>

        <ThemeToggle />

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
          className="relative inline-flex size-10 items-center justify-center rounded-full border border-line bg-paper text-secondary transition-colors hover:bg-surface hover:text-ink"
        >
          <Bell className="size-[18px]" strokeWidth={1.8} />
          {pendingRequests > 0 && (
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-green ring-2 ring-paper" />
          )}
        </Link>

        <Link
          href={settingsHref}
          className="ml-0.5 flex items-center gap-2.5 rounded-control py-1 pl-1 pr-1 transition-colors hover:bg-surface md:pr-2"
        >
          <Avatar name={profile.organizationName} tone="green" />
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
    </header>
  );
}
