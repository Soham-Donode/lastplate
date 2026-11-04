import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { isDemoMode } from "@/lib/supabase/config";
import { getPublicImpactStats } from "@/lib/data/public";
import { Logo, LogoMark } from "@/components/ui/logo";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const revalidate = 300;

const impactFormatter = new Intl.NumberFormat("en-IN");

export default async function HomePage() {
  const stats = await getPublicImpactStats();
  const hasImpact = stats.donationsShared > 0;
  const primaryHref = isDemoMode ? "/login" : "/register?role=donor";
  const secondaryHref = isDemoMode ? "/login" : "/register?role=ngo";

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo href="/" />
            {isDemoMode && (
              <Badge tone="neutral" className="hidden sm:inline-flex">
                Demo data
              </Badge>
            )}
          </div>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 text-[13px] text-secondary md:flex"
          >
            <a href="#how-it-works" className="hover:text-ink">
              How it works
            </a>
            <a href="#who-its-for" className="hover:text-ink">
              Who it&apos;s for
            </a>
            <a href="#impact" className="hover:text-ink">
              Impact
            </a>
            <a href="#food-safety" className="hover:text-ink">
              Food safety
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="size-9" />
            {!isDemoMode && (
              <Link
                href="/login"
                className={buttonStyles({
                  variant: "ghost",
                  size: "sm",
                  className: "hidden sm:inline-flex",
                })}
              >
                Sign in
              </Link>
            )}
            <Link
              href={primaryHref}
              className={buttonStyles({ size: "sm" })}
            >
              {isDemoMode ? "Open demo" : "Donate food"}
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-line bg-paper">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-medium text-secondary">
                <Sparkles className="size-3.5 text-green-text" strokeWidth={2} />
                Surplus food, redirected to people who need it
              </span>

              <h1 className="mt-5 max-w-2xl text-[38px] font-semibold leading-[1.06] tracking-[-0.045em] text-ink sm:text-[52px]">
                Good food deserves a{" "}
                <span className="text-green-text">second chance.</span>
              </h1>

              <p className="mt-5 max-w-xl text-[14.5px] leading-7 text-secondary">
                LastPlate connects restaurants, hostels, messes, and cafeterias
                with verified NGOs that can collect surplus food and get it to
                people who need it — before it goes to waste.
              </p>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href={primaryHref}
                  className={buttonStyles({ size: "lg" })}
                >
                  {isDemoMode ? "Explore the demo" : "Donate surplus food"}
                  <ArrowRight className="size-4" strokeWidth={1.8} />
                </Link>
                <Link
                  href={secondaryHref}
                  className={buttonStyles({
                    variant: "secondary",
                    size: "lg",
                  })}
                >
                  <HeartHandshake className="size-4" strokeWidth={1.8} />
                  {isDemoMode ? "See the NGO view" : "Join as an NGO"}
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-green-text" strokeWidth={2} />
                  Free for donors and NGOs
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-green-text" strokeWidth={2} />
                  NGO verification built in
                </span>
              </div>
            </div>

            <div className="rounded-frame border border-line bg-canvas p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                    A rescue, end to end
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-ink">
                    From kitchen to shared meal
                  </p>
                </div>
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-green-light text-green-dark">
                  <Leaf className="size-4" strokeWidth={1.8} />
                </span>
              </div>

              <ol className="mt-4 space-y-3">
                {[
                  {
                    icon: UtensilsCrossed,
                    title: "A donor lists surplus food",
                    detail: "Quantity, pickup window, and safe-until time.",
                  },
                  {
                    icon: MapPin,
                    title: "Verified NGOs nearby discover it",
                    detail: "Search by city, category, and food type.",
                  },
                  {
                    icon: CalendarClock,
                    title: "One collection is agreed",
                    detail: "The donor accepts a request and reserves the food.",
                  },
                  {
                    icon: PackageCheck,
                    title: "Pickup is confirmed",
                    detail: "The rescue is recorded in both histories.",
                  },
                ].map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-[11px] font-semibold text-secondary">
                      {index + 1}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[12.5px] font-medium text-ink">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[11.5px] leading-5 text-muted">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {hasImpact && (
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-4">
                  <div>
                    <p className="text-[20px] font-semibold tabular text-ink">
                      {impactFormatter.format(stats.collectionsCompleted)}
                    </p>
                    <p className="text-[10.5px] text-muted">
                      collections completed
                    </p>
                  </div>
                  <div>
                    <p className="text-[20px] font-semibold tabular text-ink">
                      {impactFormatter.format(stats.organizations)}
                    </p>
                    <p className="text-[10.5px] text-muted">
                      organizations on board
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Problem + mission */}
        <section className="border-b border-line bg-canvas">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-green-dark">
                Why it matters
              </p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] text-ink sm:text-[34px]">
                Edible food is thrown away while neighbours go without a meal.
              </h2>
            </div>
            <div className="space-y-4 text-[13.5px] leading-7 text-secondary">
              <p>
                Kitchens often know exactly how much food is left at the end of
                a service. What they lack is a simple, trustworthy way to reach
                an organization that can collect it in time.
              </p>
              <p>
                LastPlate closes that gap. Donors publish what is available and
                when it must be collected. Verified NGOs request a pickup, and
                the donor accepts exactly one. Every rescue is recorded, so both
                sides can see what happened.
              </p>
              <p className="border-l-2 border-green pl-4 text-[13px] text-ink-soft">
                We do not certify food safety. Donors confirm the food is
                suitable for donation, and both sides follow applicable local
                food-safety rules.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-b border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-green-dark">
                How it works
              </p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] text-ink sm:text-[34px]">
                Two sides, one simple handoff.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-panel border border-line bg-canvas p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-green-light text-green-dark">
                    <Building2 className="size-4" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-semibold text-ink">
                      For food donors
                    </h3>
                    <p className="text-[11.5px] text-muted">
                      Restaurants, hostels, messes, cafeterias, hotels
                    </p>
                  </div>
                </div>
                <ol className="mt-5 space-y-4">
                  {[
                    "Publish the surplus with quantity, preparation time, and a safe-consumption deadline.",
                    "Review requests from verified NGOs and accept the one that can collect in time.",
                    "Hand over the food and mark the donation collected.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green text-[10.5px] font-semibold text-white">
                        {index + 1}
                      </span>
                      <p className="text-[12.5px] leading-6 text-secondary">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-panel border border-line bg-canvas p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-green-light text-green-dark">
                    <HeartHandshake className="size-4" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-semibold text-ink">
                      For NGOs
                    </h3>
                    <p className="text-[11.5px] text-muted">
                      Food rescue groups, community kitchens, trusts
                    </p>
                  </div>
                </div>
                <ol className="mt-5 space-y-4">
                  {[
                    "Get verified once, then browse available food by city, category, and food type.",
                    "Request the quantity you can collect and explain how it will be distributed.",
                    "Confirm pickup when the food is in hand and keep a collection history.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green text-[10.5px] font-semibold text-white">
                        {index + 1}
                      </span>
                      <p className="text-[12.5px] leading-6 text-secondary">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section id="who-its-for" className="border-b border-line bg-canvas">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-green-dark">
                  Who can participate
                </p>
                <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] text-ink sm:text-[34px]">
                  Built for organizations that handle food at scale.
                </h2>
                <p className="mt-3 text-[13px] leading-6 text-muted">
                  If you prepare food and often have safe surplus, or if you
                  distribute food to people in need, LastPlate is for you.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-card border border-line bg-paper p-4">
                  <h3 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                    <UtensilsCrossed
                      className="size-4 text-green-text"
                      strokeWidth={1.8}
                    />
                    Food donors
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-[12px] text-secondary">
                    {[
                      "Restaurants and cafés",
                      "College hostels and messes",
                      "Cafeterias and cloud kitchens",
                      "Hotels and banquet halls",
                      "Bakeries and packaged-food units",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-card border border-line bg-paper p-4">
                  <h3 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                    <HeartHandshake
                      className="size-4 text-green-text"
                      strokeWidth={1.8}
                    />
                    Collection partners
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-[12px] text-secondary">
                    {[
                      "Food rescue NGOs",
                      "Community kitchens",
                      "Shelters and night shelters",
                      "Charitable trusts and foundations",
                      "Verified non-profit distributors",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact */}
        <section id="impact" className="border-b border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-green-dark">
                  Platform impact
                </p>
                <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] text-ink sm:text-[34px]">
                  Every completed pickup is a meal that stayed in the chain.
                </h2>
              </div>
              <p className="max-w-xs text-[11.5px] leading-5 text-muted">
                Live totals from this LastPlate workspace. Numbers update as
                donations and collections are recorded.
              </p>
            </div>

            {hasImpact ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    value: stats.collectionsCompleted,
                    label: "Collections completed",
                  },
                  {
                    value: stats.donationsShared,
                    label: "Donations published",
                  },
                  {
                    value: stats.organizations,
                    label: "Organizations on board",
                  },
                  {
                    value: stats.citiesReached,
                    label: "Cities reached",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-card border border-line bg-canvas p-4"
                  >
                    <p className="text-[26px] font-semibold tabular tracking-[-0.03em] text-ink">
                      {impactFormatter.format(stat.value)}
                    </p>
                    <p className="mt-1 text-[11.5px] leading-5 text-muted">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-panel border border-dashed border-line-strong bg-canvas px-5 py-10 text-center">
                <Leaf
                  className="mx-auto size-6 text-green-text"
                  strokeWidth={1.8}
                />
                <p className="mt-3 text-[13px] font-medium text-ink">
                  The first rescue is waiting to be shared.
                </p>
                <p className="mx-auto mt-1 max-w-md text-[12px] leading-6 text-muted">
                  Impact totals appear here as soon as donations and collections
                  are recorded in this workspace.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Food safety */}
        <section id="food-safety" className="border-b border-line bg-canvas">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="rounded-panel border border-line bg-paper p-5 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-green-light text-green-dark">
                    <ShieldCheck className="size-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h2 className="text-[17px] font-semibold text-ink">
                      Safety is a shared responsibility
                    </h2>
                    <p className="mt-1.5 text-[12.5px] leading-6 text-muted">
                      LastPlate is a coordination platform, not a food-safety
                      authority. Listings always show preparation time, a
                      safe-consumption deadline, and a pickup window. Expired
                      food is never shown as available.
                    </p>
                  </div>
                </div>

                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    "Donors confirm food is suitable for donation.",
                    "Allergens and food type are shown when provided.",
                    "Requests close at the safe-consumption deadline.",
                    "Both sides follow local food-safety rules.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[12px] leading-5 text-secondary"
                    >
                      <BadgeCheck
                        className="mt-0.5 size-4 shrink-0 text-green-text"
                        strokeWidth={1.8}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-solid">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div>
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white sm:text-[28px]">
                Have surplus food today?
              </h2>
              <p className="mt-1.5 max-w-xl text-[12.5px] leading-6 text-white/75">
                Publish it in a couple of minutes. A verified NGO nearby can
                request the pickup, and you stay in control of who collects.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link
                href={primaryHref}
                className={buttonStyles({
                  variant: "inverse",
                  size: "lg",
                })}
              >
                {isDemoMode ? "Explore the demo" : "Publish a donation"}
                <ArrowRight className="size-4" strokeWidth={1.8} />
              </Link>
              <Link
                href={secondaryHref}
                className={buttonStyles({
                  variant: "ghost",
                  size: "lg",
                  className:
                    "border border-white/25 text-white hover:bg-white/10 hover:text-white",
                })}
              >
                Join as an NGO
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-7" />
              <span className="text-[16px] font-semibold tracking-[-0.03em] text-ink">
                LastPlate
              </span>
            </div>
            <p className="mt-2.5 text-[11.5px] leading-5 text-muted">
              Connecting surplus food with the organizations that can get it to
              people who need it.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[11.5px] sm:grid-cols-3">
            <div className="space-y-2">
              <p className="font-medium text-ink">Platform</p>
              <a href="#how-it-works" className="block text-muted hover:text-ink">
                How it works
              </a>
              <a href="#impact" className="block text-muted hover:text-ink">
                Impact
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-ink">Organizations</p>
              <Link href="/register?role=donor" className="block text-muted hover:text-ink">
                Donate food
              </Link>
              <Link href="/register?role=ngo" className="block text-muted hover:text-ink">
                Join as an NGO
              </Link>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-ink">Account</p>
              <Link href="/login" className="block text-muted hover:text-ink">
                Sign in
              </Link>
              <a href="#food-safety" className="block text-muted hover:text-ink">
                Food safety
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-[10.5px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} LastPlate. Good food deserves a second chance.</p>
            <p>
              A coordination platform. Not a food-safety certification service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
