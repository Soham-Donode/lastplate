import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  PackageCheck,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { isDemoMode } from "@/lib/supabase/config";
import { getPublicImpactStats } from "@/lib/data/public";
import { LogoMark } from "@/components/ui/logo";
import { LandingHeader } from "@/components/layout/landing-header";

export const revalidate = 300;

const impactFormatter = new Intl.NumberFormat("en-IN");

/* Flat (gradient-free) button treatments, scoped to the landing page. */
const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent-solid px-5 text-sm font-semibold text-on-accent shadow-[0_10px_24px_-16px_rgb(31_97_50/0.5)] transition duration-200 hover:bg-accent-solid-hover active:translate-y-px dark:shadow-none";
const btnOutline =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control border border-line-strong bg-paper px-5 text-sm font-medium text-ink transition duration-200 hover:bg-surface active:translate-y-px";
const btnWhite =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control bg-white px-5 text-sm font-medium text-[#1f6132] transition duration-200 hover:bg-white/90 active:translate-y-px dark:bg-accent-solid dark:text-on-accent dark:hover:bg-accent-solid-hover";
const btnWhiteGhost =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control border border-on-accent/35 px-5 text-sm font-medium text-on-accent transition duration-200 hover:bg-on-accent/10 dark:border-accent/55 dark:text-accent-strong dark:hover:bg-accent/10";

const sectionWrap = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

export default async function HomePage() {
  const stats = await getPublicImpactStats();
  const hasImpact = stats.donationsShared > 0;
  const primaryHref = isDemoMode ? "/login" : "/register?role=donor";
  const secondaryHref = isDemoMode ? "/login" : "/register?role=ngo";

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      {/* Announcement strip */}
      <div className="border-b border-accent/15 bg-accent-soft">
        <p className="mx-auto max-w-6xl px-4 py-1.5 text-center text-[10px] font-medium tracking-[0.04em] text-accent-strong uppercase sm:px-6 sm:text-[11px] sm:tracking-[0.08em] lg:px-8">
          Free for food donors · Free for verified NGOs
        </p>
      </div>

      <LandingHeader
        demo={isDemoMode}
        primaryHref={primaryHref}
        secondaryHref={secondaryHref}
      />

      <main className="[&>section[id]]:scroll-mt-16">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div className={sectionWrap}>
            <div className="relative grid gap-8 py-10 min-[400px]:gap-10 min-[400px]:py-12 sm:gap-12 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
              {/* Quiet flat geometry behind the photo */}
              <div
                aria-hidden="true"
                className="absolute -top-8 right-0 hidden rounded-full border border-dashed border-accent-ink/25 lg:block"
                style={{ width: 300, height: 300 }}
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-8 left-1/2 hidden size-3 rounded-full bg-accent-ink lg:block"
              />

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-strong sm:gap-2 sm:px-3 sm:text-[11.5px]">
                  <Leaf className="size-3.5" strokeWidth={2} />
                  Surplus food, redirected to people who need it
                </span>

                <h1 className="mt-5 max-w-xl text-[clamp(2.25rem,9.2vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.045em] text-balance sm:mt-6 lg:text-[clamp(3rem,4.6vw,3.75rem)]">
                  Good food deserves a{" "}
                  <span className="relative inline-block text-accent-ink">
                    second chance.
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 200 10"
                      preserveAspectRatio="none"
                      className="absolute -bottom-2 left-0 h-[9px] w-full text-accent"
                    >
                      <path
                        d="M2 7c16-4 32-4 48 0s32 4 48 0 32-4 48 0 32 4 52 1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-[14px] leading-7 text-secondary sm:mt-6 sm:text-[15px] sm:leading-8">
                  LastPlate connects restaurants, hostels, messes, and
                  cafeterias with verified NGOs that can collect surplus food
                  and get it to people who need it — before it goes to waste.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href={primaryHref} className={btnPrimary}>
                    {isDemoMode ? "Explore the demo" : "Donate surplus food"}
                    <ArrowRight className="size-4" strokeWidth={1.8} />
                  </Link>
                  <Link href={secondaryHref} className={btnOutline}>
                    <HeartHandshake className="size-4" strokeWidth={1.8} />
                    {isDemoMode ? "See the NGO view" : "Join as an NGO"}
                  </Link>
                </div>

                <div className="mt-6 grid max-w-lg gap-x-6 gap-y-2 text-[12px] text-muted sm:mt-8 sm:grid-cols-2 sm:text-[12.5px]">
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

              {/* Hero photo: real rescue work, framed like everything else here */}
              <div className="relative">
                {/* Offset frame echo behind the photo */}
                <div
                  aria-hidden="true"
                  className="absolute -right-2.5 -bottom-2.5 hidden h-full w-full rounded-panel border-[1.5px] border-accent-ink/35 sm:block"
                />

                <figure className="relative m-0 overflow-hidden rounded-panel border border-line-strong bg-surface shadow-pop">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://akshayachaitanya.org/public/assets/images/akc-donate-bg-11.webp"
                    alt="A child holding a plate of food"
                    className="aspect-[4/3] max-h-[420px] w-full object-cover sm:aspect-[16/9] lg:aspect-[4/5] lg:max-h-[520px]"
                  />
                </figure>

                {/* Rotated kitchen-ticket sticker */}
                <div
                  aria-hidden="true"
                  className="absolute -top-3 right-3 z-10 rotate-[4deg] rounded-full border-[1.5px] border-dashed border-accent-ink/60 bg-accent-soft px-2.5 py-1 text-[9px] font-semibold tracking-[0.12em] text-accent-ink uppercase shadow-pop sm:right-8 sm:px-3.5 sm:py-1.5 sm:text-[10px] sm:tracking-[0.16em]"
                >
                  Fresh rescue · today
                </div>

                {/* Floating confirmation chip */}
                <div className="absolute right-3 bottom-3 left-3 z-10 flex items-center gap-2.5 rounded-control border border-line-strong bg-paper px-3 py-2.5 shadow-pop sm:right-auto sm:bottom-5 sm:left-5 sm:gap-3 sm:px-4 sm:py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent sm:size-9">
                    <CheckCircle2 className="size-4 sm:size-[18px]" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-semibold text-ink sm:text-[12.5px]">
                      Pickup confirmed — 45 servings
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted">
                      Ananda Kitchens · collected before the safe-until deadline
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why it matters */}
        <section className="border-b border-line">
          <div className={sectionWrap}>
            <div className="grid gap-8 py-12 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                  Why it matters
                </p>
                <h2 className="mt-3 text-[26px] leading-[1.1] font-semibold tracking-[-0.04em] sm:text-[38px]">
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
            <div className="max-w-2xl pt-12 sm:pt-20">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                How it works
              </p>
              <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] sm:text-[38px]">
                Two sides, one simple handoff.
              </h2>
            </div>

            <div className="mt-8 grid gap-x-8 gap-y-10 pb-12 sm:pb-20 md:grid-cols-3">
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
                    <span className="flex size-10 items-center justify-center rounded-control bg-accent text-on-accent">
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
            <div className="grid gap-8 py-12 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                  Who can participate
                </p>
                <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] sm:text-[38px]">
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
        <section id="impact" className="bg-frame dark:border-y dark:border-line">
          <div className={sectionWrap}>
            <div className="py-12 sm:py-20">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div className="max-w-xl">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-accent/80 uppercase">
                    Platform impact
                  </p>
                  <h2 className="mt-3 text-[26px] leading-[1.1] font-semibold tracking-[-0.04em] text-white sm:text-[38px]">
                    Every completed pickup is a meal that stayed in the chain.
                  </h2>
                </div>
                <p className="max-w-xs text-[12px] leading-6 text-white/55 dark:text-muted">
                  Live totals from this LastPlate workspace. Numbers update as
                  donations and collections are recorded.
                </p>
              </div>

              {hasImpact ? (
                <div className="mt-10 grid grid-cols-2 overflow-hidden rounded-frame border border-white/10 lg:grid-cols-4 dark:border-line dark:bg-paper">
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
                        "border-white/10 p-4 sm:p-7 dark:border-line",
                        index % 2 === 1 ? "border-l" : "",
                        index >= 2 ? "border-t lg:border-t-0" : "",
                        index >= 2 ? "lg:border-l" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <p className="text-[30px] font-semibold tracking-[-0.04em] text-white tabular sm:text-[40px]">
                        {impactFormatter.format(stat.value)}
                      </p>
                      <p className="mt-2 text-[12px] text-white/55 dark:text-muted">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-10 rounded-frame border border-dashed border-white/20 px-6 py-12 text-center dark:border-line-strong dark:bg-paper">
                  <Leaf
                    className="mx-auto size-6 text-white/60 dark:text-accent-ink"
                    strokeWidth={1.8}
                  />
                  <p className="mt-4 text-[13.5px] font-medium text-white">
                    The first rescue is waiting to be shared.
                  </p>
                  <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-6 text-white/55 dark:text-muted">
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
            <div className="grid gap-8 py-12 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-accent text-on-accent">
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
        <section className="bg-accent-solid dark:bg-accent-soft">
          <div className={sectionWrap}>
            <div className="flex flex-col items-start gap-8 py-12 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-[26px] leading-[1.08] font-semibold tracking-[-0.04em] text-on-accent sm:text-[40px] dark:text-ink">
                  Have surplus food today? Let&apos;s put it on someone&apos;s
                  plate.
                </h2>
                <p className="mt-3.5 max-w-xl text-[14px] leading-7 text-on-accent/80 dark:text-secondary">
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
