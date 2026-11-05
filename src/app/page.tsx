import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  MapPin,
  PackageCheck,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { isDemoMode } from "@/lib/supabase/config";
import { getPublicImpactStats } from "@/lib/data/public";
import { Logo, LogoMark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const revalidate = 300;

const impactFormatter = new Intl.NumberFormat("en-IN");

/* Flat (gradient-free) button treatments, scoped to the landing page. */
const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-[#0d3446] shadow-[0_10px_24px_-16px_rgb(20_85_111/0.5)] transition duration-200 hover:bg-accent-solid-hover active:translate-y-px sm:h-11";
const btnOutline =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control border border-line-strong bg-paper px-5 text-sm font-medium text-ink transition duration-200 hover:bg-surface active:translate-y-px";
const btnPrimarySm =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-control bg-accent-solid px-3.5 text-[13px] font-semibold text-[#0d3446] transition duration-200 hover:bg-accent-solid-hover";
const btnWhite =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-white px-5 text-sm font-medium text-[#14556f] transition duration-200 hover:bg-white/90 active:translate-y-px";
const btnWhiteGhost =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control border border-[#0d3446]/30 px-5 text-sm font-medium text-[#0d3446] transition duration-200 hover:bg-[#0d3446]/10";

const sectionWrap = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#who-its-for", label: "Who it's for" },
  { href: "#impact", label: "Impact" },
  { href: "#food-safety", label: "Food safety" },
];

/* The FSSAI-style vegetarian mark. */
function VegMark({ className }: { className?: string }) {
  return (
    <span
      aria-label="Vegetarian"
      role="img"
      className={`inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] border-accent-strong ${className ?? ""}`}
    >
      <span className="size-1.5 rounded-full bg-accent-strong" />
    </span>
  );
}

export default async function HomePage() {
  const stats = await getPublicImpactStats();
  const hasImpact = stats.donationsShared > 0;
  const primaryHref = isDemoMode ? "/login" : "/register?role=donor";
  const secondaryHref = isDemoMode ? "/login" : "/register?role=ngo";

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      {/* Announcement strip */}
      <div className="border-b border-accent/15 bg-accent-soft">
        <p className="mx-auto max-w-6xl px-4 py-1.5 text-center text-[11px] font-medium tracking-[0.08em] text-accent-strong uppercase sm:px-6 lg:px-8">
          Free for food donors · Free for verified NGOs
        </p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-canvas">
        <div className={sectionWrap}>
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo href="/" />
              {isDemoMode && (
                <span className="hidden rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11px] font-medium text-muted sm:inline-flex">
                  Demo data
                </span>
              )}
            </div>

            <nav
              aria-label="Primary"
              className="hidden items-center gap-6 text-[13px] font-medium text-muted md:flex"
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

            <div className="flex items-center gap-2">
              <ThemeToggle className="size-9 rounded-control border border-line bg-paper text-secondary [background-image:none] hover:text-ink" />
              {!isDemoMode && (
                <Link
                  href="/login"
                  className="hidden h-9 items-center rounded-control px-3.5 text-[13px] font-medium text-secondary transition-colors duration-200 hover:bg-surface hover:text-ink sm:inline-flex"
                >
                  Sign in
                </Link>
              )}
              <Link href={primaryHref} className={btnPrimarySm}>
                {isDemoMode ? "Open demo" : "Donate food"}
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div className={sectionWrap}>
            <div className="relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
              {/* Quiet flat geometry behind the mock card */}
              <div
                aria-hidden="true"
                className="absolute top-8 right-6 hidden rounded-full border border-line lg:block"
                style={{ width: 260, height: 260 }}
              />
              <div
                aria-hidden="true"
                className="absolute right-40 bottom-16 hidden size-3 rounded-full bg-accent-ink lg:block"
              />

              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-[11.5px] font-medium text-accent-strong">
                  <Leaf className="size-3.5" strokeWidth={2} />
                  Surplus food, redirected to people who need it
                </span>

                <h1 className="mt-6 max-w-xl text-[44px] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-[60px]">
                  Good food deserves a{" "}
                  <span className="text-accent-ink underline decoration-accent/40 decoration-[3px] underline-offset-[10px]">
                    second chance.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-[15px] leading-8 text-secondary">
                  LastPlate connects restaurants, hostels, messes, and
                  cafeterias with verified NGOs that can collect surplus food
                  and get it to people who need it — before it goes to waste.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href={primaryHref} className={btnPrimary}>
                    {isDemoMode ? "Explore the demo" : "Donate surplus food"}
                    <ArrowRight className="size-4" strokeWidth={1.8} />
                  </Link>
                  <Link href={secondaryHref} className={btnOutline}>
                    <HeartHandshake className="size-4" strokeWidth={1.8} />
                    {isDemoMode ? "See the NGO view" : "Join as an NGO"}
                  </Link>
                </div>

                <div className="mt-8 grid max-w-lg gap-x-6 gap-y-2.5 text-[12.5px] text-muted sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2
                      className="size-4 shrink-0 text-accent-ink"
                      strokeWidth={2}
                    />
                    Listings show safe-until times
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck
                      className="size-4 shrink-0 text-accent-ink"
                      strokeWidth={2}
                    />
                    NGOs verified before they collect
                  </span>
                </div>
              </div>

              {/* Product mockup: a listing plus an accepted request */}
              <div className="relative">
                <div className="relative rounded-panel border border-line bg-paper p-5 shadow-pop sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-strong">
                        <UtensilsCrossed className="size-5" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <VegMark />
                          <p className="truncate text-[14.5px] font-semibold">
                            Rice, dal &amp; sabzi — evening service
                          </p>
                        </div>
                        <p className="mt-0.5 text-[12px] text-muted">
                          College Mess B · Pune
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.06em] text-accent-strong uppercase">
                      Available
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-control border border-line bg-canvas py-3 text-center">
                    <div>
                      <p className="text-[17px] font-semibold tabular">45</p>
                      <p className="mt-0.5 text-[10.5px] text-muted">
                        servings
                      </p>
                    </div>
                    <div>
                      <p className="text-[17px] font-semibold tabular">19:30</p>
                      <p className="mt-0.5 text-[10.5px] text-muted">
                        safe until
                      </p>
                    </div>
                    <div>
                      <p className="text-[17px] font-semibold tabular">21:00</p>
                      <p className="mt-0.5 text-[10.5px] text-muted">
                        pickup by
                      </p>
                    </div>
                  </div>

                  <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-[12px]">
                    <div className="flex items-center gap-2 text-secondary">
                      <MapPin
                        className="size-3.5 shrink-0 text-muted"
                        strokeWidth={1.8}
                      />
                      12 Shivaji Road, near main gate
                    </div>
                    <div className="flex items-center gap-2 text-secondary">
                      <CalendarClock
                        className="size-3.5 shrink-0 text-muted"
                        strokeWidth={1.8}
                      />
                      Prepared today, 13:40
                    </div>
                  </dl>
                </div>

                {/* Overlapping status card */}
                <div className="relative z-10 -mt-5 ml-6 rounded-panel border border-line bg-frame p-4 text-white shadow-pop sm:ml-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[11px] font-semibold text-white">
                        AK
                      </span>
                      <div>
                        <p className="text-[12.5px] font-medium">
                          Ananda Kitchens requested pickup
                        </p>
                        <p className="mt-0.5 text-[11px] text-white/60">
                          Verified NGO · 2 collections this month
                        </p>
                      </div>
                    </div>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[#14556f]">
                      <CheckCircle2 className="size-4" strokeWidth={2.2} />
                    </span>
                  </div>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-control bg-white/10 px-2.5 py-1 text-[10.5px] font-medium tracking-[0.06em] text-white uppercase">
                    Request accepted · Other requests closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why it matters */}
        <section className="border-b border-line">
          <div className={sectionWrap}>
            <div className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                  Why it matters
                </p>
                <h2 className="mt-3 text-[30px] leading-[1.1] font-semibold tracking-[-0.04em] sm:text-[38px]">
                  Edible food is thrown away while neighbours go without a
                  meal.
                </h2>
              </div>
              <div className="space-y-5 text-[14px] leading-8 text-secondary">
                <p>
                  Kitchens often know exactly how much food is left at the end
                  of a service. What they lack is a simple, trustworthy way to
                  reach an organization that can collect it in time.
                </p>
                <p>
                  LastPlate closes that gap. Donors publish what is available
                  and when it must be collected. Verified NGOs request a pickup,
                  and the donor accepts exactly one. Every rescue is recorded,
                  so both sides can see what happened.
                </p>
                <div className="rounded-control border-l-2 border-accent bg-paper p-4 pl-5 shadow-[0_2px_16px_-10px_rgb(0_0_0/0.3)]">
                  <p className="flex items-start gap-2.5 text-[13px] leading-6 text-ink-soft">
                    <ShieldCheck
                      className="mt-0.5 size-4 shrink-0 text-accent-strong"
                      strokeWidth={1.8}
                    />
                    We do not certify food safety. Donors confirm the food is
                    suitable for donation, and both sides follow applicable
                    local food-safety rules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-b border-line">
          <div className={sectionWrap}>
            <div className="max-w-2xl pt-16 sm:pt-20">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                How it works
              </p>
              <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] sm:text-[38px]">
                Two sides, one simple handoff.
              </h2>
            </div>

            <div className="mt-12 grid gap-x-8 gap-y-10 pb-16 sm:pb-20 md:grid-cols-3">
              {[
                {
                  icon: UtensilsCrossed,
                  number: "01",
                  title: "List surplus food",
                  detail:
                    "A donor publishes quantity, preparation time, a safe-until deadline, and the pickup window. That is the whole form.",
                },
                {
                  icon: HeartHandshake,
                  number: "02",
                  title: "Connect with an NGO",
                  detail:
                    "Verified NGOs nearby discover the listing by city, category, and food type, then request the quantity they can collect.",
                },
                {
                  icon: PackageCheck,
                  number: "03",
                  title: "Collect and distribute",
                  detail:
                    "The donor accepts exactly one request — others close automatically. Pickup is confirmed and the rescue is recorded.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="border-t-2 border-line pt-6 lg:border-t lg:border-l-2 lg:pl-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-control bg-accent text-[#0d3446]">
                      <step.icon className="size-5" strokeWidth={1.8} />
                    </span>
                    <span className="text-[26px] font-semibold tracking-[-0.04em] text-muted/50 tabular">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[16px] font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-7 text-secondary">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section id="who-its-for" className="border-b border-line bg-paper">
          <div className={sectionWrap}>
            <div className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                  Who can participate
                </p>
                <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] sm:text-[38px]">
                  Built for organizations that handle food at scale.
                </h2>
                <p className="mt-4 text-[13.5px] leading-7 text-muted">
                  If you prepare food and often have safe surplus, or if you
                  distribute food to people in need, LastPlate is for you.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Free to join", "City-wide pickup", "Full history"].map(
                    (pill) => (
                      <span
                        key={pill}
                        className="rounded-full border border-line bg-canvas px-3 py-1 text-[11.5px] font-medium text-secondary"
                      >
                        {pill}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-panel border border-line bg-canvas p-5 sm:p-6">
                  <h3 className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
                    <span className="flex size-9 items-center justify-center rounded-control bg-accent-soft text-accent-strong">
                      <UtensilsCrossed className="size-4" strokeWidth={1.8} />
                    </span>
                    Food donors
                  </h3>
                  <ul className="mt-5 space-y-2.5 text-[12.5px] text-secondary">
                    {[
                      "Restaurants and cafés",
                      "College hostels and messes",
                      "Cafeterias and cloud kitchens",
                      "Hotels and banquet halls",
                      "Bakeries and packaged-food units",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <span className="size-1.5 shrink-0 rounded-full bg-accent-ink" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-panel border border-line bg-canvas p-5 sm:p-6">
                  <h3 className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
                    <span className="flex size-9 items-center justify-center rounded-control bg-accent-soft text-accent-strong">
                      <HeartHandshake className="size-4" strokeWidth={1.8} />
                    </span>
                    Collection partners
                  </h3>
                  <ul className="mt-5 space-y-2.5 text-[12.5px] text-secondary">
                    {[
                      "Food rescue NGOs",
                      "Community kitchens",
                      "Shelters and night shelters",
                      "Charitable trusts and foundations",
                      "Verified non-profit distributors",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <span className="size-1.5 shrink-0 rounded-full bg-accent-ink" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact — solid dark band */}
        <section id="impact" className="bg-frame">
          <div className={sectionWrap}>
            <div className="py-16 sm:py-20">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div className="max-w-xl">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-accent/80 uppercase">
                    Platform impact
                  </p>
                  <h2 className="mt-3 text-[30px] leading-[1.1] font-semibold tracking-[-0.04em] text-white sm:text-[38px]">
                    Every completed pickup is a meal that stayed in the chain.
                  </h2>
                </div>
                <p className="max-w-xs text-[12px] leading-6 text-white/55">
                  Live totals from this LastPlate workspace. Numbers update as
                  donations and collections are recorded.
                </p>
              </div>

              {hasImpact ? (
                <div className="mt-10 grid grid-cols-2 overflow-hidden rounded-frame border border-white/10 lg:grid-cols-4">
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
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className={[
                        "border-white/10 p-6 sm:p-7",
                        index % 2 === 1 ? "border-l" : "",
                        index >= 2 ? "border-t lg:border-t-0" : "",
                        index >= 2 ? "lg:border-l" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <p className="text-[36px] font-semibold tracking-[-0.04em] text-white tabular sm:text-[40px]">
                        {impactFormatter.format(stat.value)}
                      </p>
                      <p className="mt-2 text-[12px] text-white/55">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-10 rounded-frame border border-dashed border-white/20 px-6 py-12 text-center">
                  <Leaf
                    className="mx-auto size-6 text-white/60"
                    strokeWidth={1.8}
                  />
                  <p className="mt-4 text-[13.5px] font-medium text-white">
                    The first rescue is waiting to be shared.
                  </p>
                  <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-6 text-white/55">
                    Impact totals appear here as soon as donations and
                    collections are recorded in this workspace.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Food safety */}
        <section id="food-safety" className="border-b border-line">
          <div className={sectionWrap}>
            <div className="grid gap-8 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-accent text-[#0d3446]">
                  <ShieldCheck className="size-5" strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.035em] sm:text-[28px]">
                    Safety is a shared responsibility
                  </h2>
                  <p className="mt-2.5 text-[13px] leading-7 text-secondary">
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
                    className="flex items-start gap-2.5 rounded-control border border-line bg-paper p-3.5 text-[12.5px] leading-5 text-secondary"
                  >
                    <BadgeCheck
                      className="mt-0.5 size-4 shrink-0 text-accent-ink"
                      strokeWidth={1.8}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-accent-solid">
          <div className={sectionWrap}>
            <div className="flex flex-col items-start gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-[30px] leading-[1.08] font-semibold tracking-[-0.04em] text-[#0d3446] sm:text-[40px]">
                  Have surplus food today? Let&apos;s put it on someone&apos;s
                  plate.
                </h2>
                <p className="mt-3.5 max-w-xl text-[14px] leading-7 text-[#0d3446]/80">
                  Publish it in a couple of minutes. A verified NGO nearby can
                  request the pickup, and you stay in control of who collects —
                  with a full record of every rescue.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={primaryHref} className={btnWhite}>
                  {isDemoMode ? "Explore the demo" : "Publish a donation"}
                  <ArrowRight className="size-4" strokeWidth={1.8} />
                </Link>
                <Link href={secondaryHref} className={btnWhiteGhost}>
                  Join as an NGO
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-canvas">
        <div className={sectionWrap}>
          <div className="flex flex-col gap-10 py-12 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <LogoMark className="size-7" />
                <span className="text-[16px] font-semibold tracking-[-0.03em] text-ink">
                  LastPlate
                </span>
              </div>
              <p className="mt-3 text-[12px] leading-6 text-muted">
                Connecting surplus food with the organizations that can get it
                to people who need it.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[12px] sm:grid-cols-3">
              <div className="space-y-2.5">
                <p className="font-semibold text-ink">Platform</p>
                <a href="#how-it-works" className="block text-muted hover:text-ink">
                  How it works
                </a>
                <a href="#impact" className="block text-muted hover:text-ink">
                  Impact
                </a>
              </div>
              <div className="space-y-2.5">
                <p className="font-semibold text-ink">Organizations</p>
                <Link
                  href="/register?role=donor"
                  className="block text-muted hover:text-ink"
                >
                  Donate food
                </Link>
                <Link
                  href="/register?role=ngo"
                  className="block text-muted hover:text-ink"
                >
                  Join as an NGO
                </Link>
              </div>
              <div className="space-y-2.5">
                <p className="font-semibold text-ink">Account</p>
                <Link href="/login" className="block text-muted hover:text-ink">
                  Sign in
                </Link>
                <a href="#food-safety" className="block text-muted hover:text-ink">
                  Food safety
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-line py-5 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} LastPlate. Good food deserves a
              second chance.
            </p>
            <p>
              A coordination platform. Not a food-safety certification service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
