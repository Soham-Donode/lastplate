"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck, X } from "lucide-react";
import type { Profile } from "@/types";
import { cn } from "@/lib/utils";
import {
  isNavItemActive,
  navigationForRole,
  type NavItem,
} from "@/lib/navigation";
import { signOutAction } from "@/actions/auth";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

function NavLink({
  item,
  pathname,
  pendingRequests,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  pendingRequests: number;
  onNavigate?: () => void;
}) {
  const active = isNavItemActive(pathname, item);
  const Icon = item.icon;
  const showBadge =
    (item.badge === "pending-requests" ||
      item.badge === "pending-verification") &&
    pendingRequests > 0;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex h-[38px] items-center gap-2.5 rounded-[11px] border px-2.5 text-[13px] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active
            ? "border-accent/60 bg-accent-soft font-medium text-accent-ink"
            : "border-transparent text-secondary hover:bg-surface hover:text-ink",
        )}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute -left-px top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full bg-accent-ink"
          />
        )}
        <Icon
          aria-hidden="true"
          className={cn(
            "size-[18px] shrink-0 transition-colors duration-200",
            active
              ? "text-accent-strong"
              : "text-muted group-hover:text-secondary",
          )}
          strokeWidth={1.8}
        />
        <span className="truncate">{item.label}</span>
        {showBadge && (
          <span
            className={cn(
              "ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-[10.5px] font-medium tabular",
              active
                ? "border-accent/60 bg-paper text-accent-ink"
                : "border-line bg-surface text-secondary",
            )}
          >
            {pendingRequests > 99 ? "99+" : pendingRequests}
          </span>
        )}
      </Link>
    </li>
  );
}

export function Sidebar({
  profile,
  pendingRequests,
  demo,
  onNavigate,
  onClose,
}: {
  profile: Profile;
  pendingRequests: number;
  demo: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const navigation = navigationForRole(profile.role);
  const demoRoles = [
    { value: "donor", label: "Donor" },
    { value: "ngo", label: "NGO" },
    { value: "admin", label: "Admin" },
  ] as const;

  return (
    <div className="flex h-full w-full flex-col lg:w-[264px]">
      <div className="flex h-[76px] shrink-0 items-center justify-between px-5">
        <Logo href={navigation.home} onClick={onNavigate} />
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden"
          >
            <X className="size-[18px]" strokeWidth={1.8} />
          </Button>
        )}
      </div>

      <nav
        aria-label={navigation.label}
        className="scrollbar-none flex-1 overflow-y-auto px-3 pb-4"
      >
        <p className="px-2.5 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted/80">
          Menu
        </p>
        <ul className="space-y-1">
          {navigation.main.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              pendingRequests={pendingRequests}
              onNavigate={onNavigate}
            />
          ))}
        </ul>

        <div className="mx-2.5 my-5 h-px bg-line" />

        <p className="px-2.5 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted/80">
          General
        </p>
        <ul className="space-y-1">
          {navigation.general.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              pendingRequests={pendingRequests}
              onNavigate={onNavigate}
            />
          ))}
          <li>
            <form action={signOutAction}>
              <button
                type="submit"
                className="group flex h-[38px] w-full items-center gap-2.5 rounded-[11px] border border-transparent px-2.5 text-[13px] text-secondary transition-all duration-200 hover:bg-surface hover:text-ink"
              >
                <LogOut
                  aria-hidden="true"
                  className="size-[18px] shrink-0 text-muted transition-colors group-hover:text-secondary"
                  strokeWidth={1.8}
                />
                <span>Sign out</span>
              </button>
            </form>
          </li>
        </ul>
      </nav>

      <div className="shrink-0 px-3 pb-4">
        <div className="glass-subtle glass-sheen rounded-[16px] p-3.5">
          <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink">
            <ShieldCheck
              aria-hidden="true"
              className="size-3.5 text-accent-ink"
              strokeWidth={2}
            />
            Food safety first
          </p>
          <p className="mt-1.5 text-[11px] leading-4 text-muted">
            Only publish food you would be comfortable serving yourself.
          </p>
          <p className="mt-2.5 truncate border-t border-line pt-2 text-[10.5px] text-muted">
            {profile.organizationName}
          </p>
          {demo && (
            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              {demoRoles
                .filter((role) => role.value !== profile.role)
                .map((role) => (
                  <Link
                    key={role.value}
                    href={`/api/demo-role?role=${role.value}`}
                    onClick={onNavigate}
                    className="text-[10.5px] font-medium text-accent-strong underline-offset-2 hover:underline"
                  >
                    {role.label} view
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
