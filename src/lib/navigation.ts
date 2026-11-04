import type { LucideIcon } from "lucide-react";
import {
  Compass,
  History,
  Inbox,
  LayoutDashboard,
  PackageCheck,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: "pending-requests" | "pending-verification";
}

export const donorNavigation: NavItem[] = [
  {
    label: "Overview",
    href: "/donor/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "My donations",
    href: "/donor/donations",
    icon: UtensilsCrossed,
  },
  {
    label: "Create donation",
    href: "/donor/donations/new",
    icon: PlusCircle,
  },
  {
    label: "Collection requests",
    href: "/donor/requests",
    icon: Inbox,
    badge: "pending-requests",
  },
  {
    label: "History",
    href: "/donor/history",
    icon: History,
  },
];

export const donorGeneralNavigation: NavItem[] = [
  {
    label: "Settings",
    href: "/donor/settings",
    icon: Settings,
  },
];

export const ngoNavigation: NavItem[] = [
  {
    label: "Overview",
    href: "/ngo/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Explore donations",
    href: "/ngo/explore",
    icon: Compass,
  },
  {
    label: "My requests",
    href: "/ngo/requests",
    icon: Inbox,
    badge: "pending-requests",
  },
  {
    label: "Collections",
    href: "/ngo/collections",
    icon: PackageCheck,
  },
];

export const ngoGeneralNavigation: NavItem[] = [
  {
    label: "Settings",
    href: "/ngo/settings",
    icon: Settings,
  },
];

export const adminNavigation: NavItem[] = [
  {
    label: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Organizations",
    href: "/admin/users",
    icon: Users,
    badge: "pending-verification",
  },
  {
    label: "Donations",
    href: "/admin/donations",
    icon: UtensilsCrossed,
  },
];

export const adminGeneralNavigation: NavItem[] = [
  {
    label: "Settings",
    href: "/admin/settings",
    icon: ShieldCheck,
  },
];

export function navigationForRole(role: UserRole) {
  if (role === "ngo") {
    return {
      main: ngoNavigation,
      general: ngoGeneralNavigation,
      home: "/ngo/dashboard",
      label: "NGO navigation",
    };
  }

  if (role === "admin") {
    return {
      main: adminNavigation,
      general: adminGeneralNavigation,
      home: "/admin/dashboard",
      label: "Administration navigation",
    };
  }

  return {
    main: donorNavigation,
    general: donorGeneralNavigation,
    home: "/donor/dashboard",
    label: "Donor navigation",
  };
}

export function isNavItemActive(
  pathname: string,
  item: Pick<NavItem, "href" | "exact">,
) {
  if (item.exact) return pathname === item.href;

  // "Create donation" lives under /donor/donations but should not keep the
  // "My donations" item highlighted while the form is open.
  if (
    item.href === "/donor/donations" &&
    pathname.startsWith("/donor/donations/new")
  ) {
    return false;
  }

  // NGO donation details live under /ngo/donations but belong to Explore.
  if (item.href === "/ngo/explore" && pathname.startsWith("/ngo/donations/")) {
    return true;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
