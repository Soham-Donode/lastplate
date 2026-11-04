import Link from "next/link";
import { Compass, Search, SlidersHorizontal } from "lucide-react";
import type { FoodCategory, FoodType } from "@/types";
import { requireNgo } from "@/lib/auth";
import { getNgoRepository } from "@/lib/data";
import { FOOD_CATEGORIES, FOOD_TYPE_LABELS } from "@/lib/constants";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/page-header";
import { AvailableDonationCard } from "@/components/donations/available-donation-card";

export const metadata = {
  title: "Explore donations",
};

type ExploreParams = {
  q?: string;
  category?: string;
  foodType?: string;
  city?: string;
  sort?: string;
};

const CATEGORY_VALUES = new Set<string>(
  FOOD_CATEGORIES.map((category) => category.value),
);

function parseCategory(value: string | undefined): FoodCategory | "all" {
  return value && CATEGORY_VALUES.has(value)
    ? (value as FoodCategory)
    : "all";
}

function parseFoodType(value: string | undefined): FoodType | "all" {
  return value === "vegetarian" || value === "non_vegetarian"
    ? value
    : "all";
}

function parseSort(value: string | undefined): "newest" | "deadline" {
  return value === "deadline" ? "deadline" : "newest";
}

export default async function ExploreDonationsPage({
  searchParams,
}: {
  searchParams: Promise<ExploreParams>;
}) {
  const profile = await requireNgo();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = parseCategory(params.category);
  const foodType = parseFoodType(params.foodType);
  const city = params.city?.trim() || "all";
  const sort = parseSort(params.sort);

  const repository = getNgoRepository();
  const [donations, cities] = await Promise.all([
    repository.listAvailableDonations(profile.id, {
      q,
      category,
      foodType,
      city,
      sort,
    }),
    repository.listAvailableCities(),
  ]);

  const hasFilters =
    Boolean(q) ||
    category !== "all" ||
    foodType !== "all" ||
    city !== "all" ||
    sort !== "newest";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Explore donations"
        description="Browse surplus food published by verified donors. Send a collection request for anything your organization can collect and distribute."
        actions={
          <Link
            href="/ngo/requests"
            className={buttonStyles({ variant: "secondary" })}
          >
            My requests
          </Link>
        }
      />

      <Card className="p-4 sm:p-5">
        <form
          action="/ngo/explore"
          method="get"
          role="search"
          className="space-y-3"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field
              label="Search food"
              htmlFor="q"
              className="min-w-0 flex-1"
            >
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.8}
                />
                <Input
                  id="q"
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Search by food title"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Category" htmlFor="category" className="sm:w-44">
              <Select id="category" name="category" defaultValue={category}>
                <option value="all">All categories</option>
                {FOOD_CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Food type" htmlFor="foodType" className="sm:w-44">
              <Select
                id="foodType"
                name="foodType"
                defaultValue={foodType}
              >
                <option value="all">All food types</option>
                <option value="vegetarian">
                  {FOOD_TYPE_LABELS.vegetarian}
                </option>
                <option value="non_vegetarian">
                  {FOOD_TYPE_LABELS.non_vegetarian}
                </option>
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="City" htmlFor="city" className="sm:w-48">
              <Select id="city" name="city" defaultValue={city}>
                <option value="all">All cities</option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Sort by" htmlFor="sort" className="sm:w-48">
              <Select id="sort" name="sort" defaultValue={sort}>
                <option value="newest">Newest first</option>
                <option value="deadline">Pickup deadline</option>
              </Select>
            </Field>

            <div className="flex items-center gap-2 sm:ml-auto">
              <button type="submit" className={buttonStyles()}>
                <SlidersHorizontal className="size-4" strokeWidth={1.8} />
                Apply filters
              </button>
              {hasFilters && (
                <Link
                  href="/ngo/explore"
                  className={buttonStyles({ variant: "ghost" })}
                >
                  Clear
                </Link>
              )}
            </div>
          </div>
        </form>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-muted">
          <span className="tabular font-medium text-ink">
            {donations.length}
          </span>{" "}
          {donations.length === 1 ? "donation" : "donations"} available
          {city !== "all" ? ` in ${city}` : ""}
        </p>
      </div>

      {donations.length === 0 ? (
        <Card className="p-5 sm:p-6">
          <EmptyState
            icon={Compass}
            title="No donations match these filters"
            description="Try a different category, city, or search term. New listings appear as soon as donors publish them."
            action={
              <Link
                href="/ngo/explore"
                className={buttonStyles({ variant: "secondary" })}
              >
                Clear filters
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {donations.map((donation) => (
            <AvailableDonationCard key={donation.id} donation={donation} />
          ))}
        </div>
      )}
    </div>
  );
}
