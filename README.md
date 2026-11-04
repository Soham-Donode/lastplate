# LastPlate

LastPlate connects food donors — restaurants, hostels, messes, cafeterias, and
hotels — with NGOs that can collect surplus edible food and distribute it to
people who need it.

This repository is the MVP: a Next.js App Router application backed by Supabase
(PostgreSQL, Auth, and Storage). It is built to run on free-tier hosting.

## What is implemented

### Authentication

- Email/password registration and sign-in through Supabase Auth.
- Role selection during registration: food donor or NGO.
- NGO verification details (registration number and notes) collected at sign-up
  and reviewed by an administrator.
- Email confirmation, password reset, and session persistence.
- Role-based dashboard redirects and protected routes.
- Split-panel auth layout with a manual light/dark theme toggle.

### Donor workspace

- Data-driven dashboard with pickup deadlines, recent requests, recent
  donations, and a collection summary.
- Donation publishing with React Hook Form + Zod validation on the client and
  the server, including preparation time, safe-consumption deadline, pickup
  deadline, allergens, food type, and an optional image.
- A map picker on the donation form and in organization settings, so pickup
  points and the NGO map centre are pinned rather than guessed from a city name.
- Donation list with status and title filters.
- Donation detail with accept/reject actions for collection requests.
- Atomic request acceptance: assigning one NGO rejects every other pending
  request for the same donation.
- Mark-as-collected flow that writes a collection record and completes the
  accepted request.
- Request inbox, collection history, and organization profile settings.
- Responsive shell with a desktop sidebar, mobile drawer, search, and a
  pending-request indicator.

### NGO workspace

- Dashboard with available food nearby, recent requests, upcoming pickups, and
  a request/collection summary.
- A donation map at the top of the dashboard: available pickups within 10 km of
  the organization's pinned location, shown as photo markers that open the
  donation when selected.
- Search and filtering by title, category, food type, and city.
- Donation detail with request quantity, an optional message, and cancellation
  of pending requests.
- Collection confirmation for the assigned NGO.
- Collection history and organization profile settings.
- Verification gate: unverified NGOs can browse but cannot request food.

### Admin workspace

- Platform overview with the NGO verification queue, recent donations, recent
  collections, and account health.
- User directory with donor/NGO filters and account status.
- NGO verification and rejection.
- All-donations view across every donor.
- Minimal account settings.

### Public site

- Landing page explaining the problem, the collection workflow, who can take
  part, food-safety expectations, and how to get started.
- Live impact totals from a security-definer aggregate RPC.

### Data and security

- SQL migrations in `supabase/migrations/` for tables, constraints, indexes,
  triggers, views, RLS policies, storage policies, and transactional RPCs.
- Prisma is used for migrations and the sample seed only. The app reads and
  writes through Supabase Auth + RLS.
- Row Level Security is the source of truth for authorization; the UI checks
  are only a convenience.
- `public_profiles` exposes only organization name, type, city, role, and
  verification status. Email, phone, and address never leave the database for
  another organization.
- Assignment and collection transitions use `security definer` functions with
  row locks, so a donation cannot be assigned twice under concurrency.
- Server Actions validate all input with Zod before writing.

## Sample accounts

A seeded workspace and credentials are included for review:

- See [`sample.txt`](./sample.txt) for the full list.
- Every sample account uses the password `LastPlate#2026`.
- Donor: `ananya@saffronkitchen.in`
- Verified NGO: `meera@annapurnatrust.org`
- Admin: `priya@lastplate.org`

These accounts are for development and review only. Change or delete them before
using the project with real organizations.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

### Demo mode

If `NEXT_PUBLIC_SUPABASE_URL` and a Supabase public key are empty, the app runs
in a clearly labelled demo mode. It uses a local JSON workspace at
`.data/demo-db.json` and `.data/uploads/` for images. No Supabase project is
required to explore the donor, NGO, and admin dashboards.

- The login page shows a demo notice and role shortcuts.
- Mutations persist to `.data/` and are shared by all visitors of that server.
- To reset the workspace, stop the server and delete the `.data` directory:

  ```bash
  rm -rf .data
  ```

  The next request reseeds it. The workspace also reseeds automatically after
  24 hours when no actionable donation remains.

Demo data is deliberately relative to the seed time, so deadlines stay
realistic. It is not production data and is never used when Supabase
credentials are present.

### Supabase setup

1. Create a Supabase project.
2. Copy the project URL and a public key into `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   # or the newer publishable key
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

   `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with
   `NEXT_PUBLIC_` or use it in browser code.

3. Add the Prisma connection strings. Use the Supabase session pooler for
   `DATABASE_URL` and the direct connection for `DIRECT_URL`:

   ```bash
   DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```

4. Apply the schema and generate the Prisma client:

   ```bash
   npm run db:migrate
   npm run db:generate
   ```

   The canonical SQL still lives in `supabase/migrations/`. With the Supabase
   CLI you can alternatively run `supabase db push`.

5. Seed the sample workspace (optional):

   ```bash
   npm run db:seed
   ```

   The seed is idempotent for the sample donations and rewrites `sample.txt`.
   It creates the sample auth users directly, so no email confirmation step is
   needed for these accounts.

6. In **Authentication → Providers**, enable Email. For local development you
   may want to disable email confirmation; production should keep it on.
7. Create the first admin manually after signing up:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

   The profile guard only blocks self-service role changes; SQL run as the
   project owner is allowed.

8. Optional: schedule expiry so stale listings are normalized even when nobody
   opens the app. Run daily from `pg_cron`:

   ```sql
   select cron.schedule(
     'lastplate-expire-donations',
     '0 * * * *',
     $$select public.expire_stale_donations();$$
   );
   ```

   The data layer also treats an `available` donation past its safe or pickup
   deadline as expired at read time, so the UI never shows it as live.

### Storage

The migration creates a public `donation-images` bucket. Signed-in users may
upload, replace, and delete files under a folder named after their user id
(`<user-id>/<file>`). Donation images are publicly readable, which keeps the
MVP simple; do not upload private documents to this bucket.

## Commands

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the development server                 |
| `npm run build`     | Production build                             |
| `npm run start`     | Serve the production build                   |
| `npm run typecheck` | TypeScript without emitting                  |
| `npm run lint`      | ESLint with zero warnings                    |
| `npm run db:migrate`| Apply Prisma migrations to the database      |
| `npm run db:generate`| Generate Prisma Client                      |
| `npm run db:seed`   | Seed the sample workspace and write `sample.txt` |
| `npm run db:studio` | Open Prisma Studio                           |

## Project structure

```text
src/
  app/
    (public)/                 Landing page
    (auth)/                   Login, register, forgot/reset password
    (dashboard)/
      donor/                  Dashboard, donations, requests, history, settings
      ngo/                    Dashboard, explore, requests, collections, settings
      admin/                  Dashboard, users, donations, settings
    api/                      Demo uploads and role switching
  actions/                    Server Actions for auth, donations, requests, uploads
  components/
    dashboard/                Dashboard lists, tables, summaries, page headers
    donations/                Donation form, cards, image uploader
    layout/                   Auth shell, sidebar, topbar, responsive shell
    map/                      Leaflet donation map and location picker
    ui/                       Buttons, inputs, panels, badges, theme toggle
  lib/
    data/                     Repository contract, demo/Supabase implementations
    demo/                     Seed data, file store, business logic
    supabase/                 Browser/server clients and config
    validations/              Zod schemas
    geo.ts                    Distance helpers and city-centre fallbacks
  types/                      Shared domain types
prisma/
  schema.prisma               Prisma schema generated from the SQL migrations
  migrations/                 Applied schema migration
  seed.mjs                    Sample auth users, profiles, donations, requests
supabase/migrations/          Canonical schema, RLS, RPCs, storage policies
```

## Workflow rules

- A donation is `available` until a donor accepts a request. Acceptance moves
  it to `assigned`, sets `assigned_ngo_id`, and rejects other pending requests
  in the same transaction.
- Only the donor or the assigned NGO can mark an assigned donation as
  `collected`. That writes one `collection_records` row and completes the
  accepted request.
- Collection requests are only accepted while the donation is available and
  both its safe-consumption and pickup deadlines are in the future.
- Donors can edit only their own still-available donations. Completed donations
  are immutable from the donor UI and direct updates are blocked by RLS.
- An NGO must be verified before it can request a collection. This is enforced
  by a database trigger as well as the insert policy.

## Design

The interface uses only black, white/grey, and green (`#27864A`, with
`#176638` and `#EAF5ED` support tones). It is mobile-first, uses Inter, and
avoids gradients, glass effects, and decorative motion. Theme tokens live in
`src/app/globals.css`; dark mode overrides the same tokens and is controlled by
the theme toggle in the topbar, public header, and auth pages.

Maps use Leaflet with OpenStreetMap tiles, so no API key or paid mapping
service is required. Tiles are muted with CSS to match the palette. Donation
and profile coordinates are stored as nullable `latitude`/`longitude` columns;
profiles without coordinates fall back to their city centre for the map view,
and donations without coordinates are not plotted as markers.
