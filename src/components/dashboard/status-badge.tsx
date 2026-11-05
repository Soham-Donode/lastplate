import {
  Apple,
  Carrot,
  CookingPot,
  Croissant,
  Package,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type {
  CollectionRequestStatus,
  DonationStatus,
  FoodCategory,
} from "@/types";
import { Badge, StatusDot } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const donationStatusConfig: Record<
  DonationStatus,
  { label: string; tone: "accent" | "outline" | "neutral" | "dark"; dot: boolean }
> = {
  available: { label: "Available", tone: "accent", dot: true },
  assigned: { label: "Assigned", tone: "outline", dot: true },
  collected: { label: "Collected", tone: "neutral", dot: true },
  expired: { label: "Expired", tone: "neutral", dot: false },
  cancelled: { label: "Cancelled", tone: "neutral", dot: false },
};

export function DonationStatusBadge({
  status,
  className,
}: {
  status: DonationStatus;
  className?: string;
}) {
  const config = donationStatusConfig[status];

  return (
    <Badge
      tone={config.tone}
      className={cn(status === "expired" && "text-muted", className)}
    >
      {config.dot && (
        <StatusDot
          tone={
            status === "available" || status === "collected"
              ? "accent"
              : status === "assigned"
                ? "dark"
                : "neutral"
          }
        />
      )}
      {config.label}
    </Badge>
  );
}

const requestStatusConfig: Record<
  CollectionRequestStatus,
  { label: string; tone: "accent" | "outline" | "neutral"; dot: boolean }
> = {
  pending: { label: "Pending", tone: "outline", dot: true },
  accepted: { label: "Accepted", tone: "accent", dot: true },
  rejected: { label: "Rejected", tone: "neutral", dot: false },
  cancelled: { label: "Cancelled", tone: "neutral", dot: false },
  completed: { label: "Completed", tone: "accent", dot: true },
};

export function RequestStatusBadge({
  status,
  className,
}: {
  status: CollectionRequestStatus;
  className?: string;
}) {
  const config = requestStatusConfig[status];

  return (
    <Badge
      tone={config.tone}
      className={cn(
        (status === "rejected" || status === "cancelled") && "text-muted",
        className,
      )}
    >
      {config.dot && (
        <StatusDot
          tone={status === "pending" ? "dark" : "accent"}
        />
      )}
      {config.label}
    </Badge>
  );
}

const categoryIcons: Record<FoodCategory, LucideIcon> = {
  cooked_meals: CookingPot,
  rice_grains: Wheat,
  bread_bakery: Croissant,
  fruits: Apple,
  vegetables: Carrot,
  packaged_food: Package,
  other: UtensilsCrossed,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: FoodCategory;
  className?: string;
}) {
  const Icon = categoryIcons[category];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-line/60 bg-surface text-muted",
        className,
      )}
    >
      <Icon className="size-[17px]" strokeWidth={1.7} />
    </span>
  );
}
