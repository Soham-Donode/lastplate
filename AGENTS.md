# AGENTS.md — LastPlate

## 1. Project Overview

Build **LastPlate**, a simple food-waste management platform that connects food donors with NGOs.

LastPlate aims to reduce food wastage by allowing restaurants, hostels, college messes, and other food establishments to publish surplus edible food. NGOs can discover available donations, request collection, and distribute the food to people in need.

The primary objective is to create a functional, lightweight MVP rather than an overly complicated enterprise application.

### Core Goals

- Reduce edible food wastage.
- Connect food donors with NGOs.
- Make surplus food discovery and collection simple.
- Track donations from publication to successful collection.
- Provide basic statistics about food rescued and donations completed.

## 2. Technology Stack

Use the following technologies:

- **Framework:** Next.js with App Router.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS.
- **UI Components:** shadcn/ui where useful.
- **Icons:** Lucide React.
- **Database:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth.
- **File Storage:** Supabase Storage.
- **Deployment:** Vercel.
- **Form Validation:** Zod.
- **Form Management:** React Hook Form.

Prefer stable, compatible package versions.

Do not introduce unnecessary libraries or infrastructure.

### Important

- Use Supabase as the primary backend.
- Do not introduce MongoDB alongside Supabase.
- Do not create a separate Express or FastAPI backend.
- Use Next.js Server Actions and Route Handlers where appropriate.
- Keep the application compatible with free-tier hosting and database services.

## 3. User Roles

The platform has three roles.

### A. Donor

Food donors include:
- Restaurants.
- College hostels.
- College messes.
- Cafeterias.
- Hotels.
- Other food establishments.

Donors should be able to:

- Register and log in.
- Manage their organization profile.
- Publish surplus food donations.
- Upload food images.
- Specify quantity and food details.
- Specify pickup location.
- Set a collection deadline.
- View incoming NGO requests.
- Accept or reject requests.
- Mark donations as collected.
- View donation history.

### B. NGO

NGOs represent organizations that collect and distribute surplus food.

NGOs should be able to:

- Register and log in.
- Manage their organization profile.
- Browse available donations.
- Search and filter donations.
- View donation details.
- Request food collection.
- View request status.
- Cancel pending requests.
- Confirm successful pickup.
- View their collection history.

### C. Admin

Admin functionality should remain minimal in the MVP.

Admins should be able to:

- View registered users.
- View donors and NGOs.
- Verify NGO accounts.
- View all donations.
- Monitor collection activity.
- Disable inappropriate accounts if necessary.

Do not build a complex administration system.

## 4. Core Features

### 4.1 Authentication

Implement authentication using Supabase Auth.

Requirements:

- Email and password registration.
- Email and password login.
- Logout.
- Password reset.
- Role selection during registration.
- Role-based dashboard redirection.
- Protected routes.
- Session persistence.

During registration, collect:

- Full name.
- Email.
- Password.
- Organization name.
- Organization type.
- Phone number.
- City.
- Address.

NGOs should additionally provide basic organization verification details.

Never store passwords manually.

Never expose the Supabase service role key in client-side code.

### 4.2 Donation Management

A donor should be able to create a donation containing:

- Food title.
- Food description.
- Food category.
- Quantity.
- Quantity unit.
- Vegetarian / Non-vegetarian classification.
- Preparation time.
- Expiry or safe-consumption deadline.
- Pickup deadline.
- Pickup address.
- Optional food image.
- Additional instructions.

Suggested food categories:

- Cooked meals.
- Rice and grains.
- Bread and bakery.
- Fruits.
- Vegetables.
- Packaged food.
- Other.

Donation visibility:

- Available donations should be visible to eligible NGO accounts.
- Accepted donations should no longer appear as generally available.
- Expired donations should automatically be excluded from available listings.

Never allow donors to edit completed donations.

### 4.3 NGO Collection Requests

An NGO can request a donation.

Each request should contain:

- Donation ID.
- NGO ID.
- Request message (optional).
- Requested quantity.
- Request timestamp.
- Request status.

Request statuses:

- Pending.
- Accepted.
- Rejected.
- Cancelled.
- Completed.

Business rules:

- Multiple NGOs may request the same available donation.
- Only one NGO can be assigned a donation in the MVP.
- Once a donor accepts a request, other pending requests should be rejected or closed.
- A donation cannot be assigned twice.
- Only the assigned NGO can confirm collection.
- The donor can mark the donation as picked up.
- Completed donations must remain in the donation history.

Use database transactions or PostgreSQL functions where atomic updates are necessary to prevent race conditions.

### 4.4 Search and Discovery

NGOs should be able to browse donations.

Implement:

- Search by food title.
- Filter by category.
- Filter by vegetarian classification.
- Filter by location/city.
- Sort by newest.
- Show pickup deadline.
- Show available quantity.

Keep search simple. Do not introduce external search infrastructure.

### 4.5 Dashboard

Donor dashboard:

- Total donations published.
- Active donations.
- Donations successfully collected.
- Total estimated food quantity donated.
- Recent donation activity.

NGO dashboard:

- Available donations.
- Pending requests.
- Accepted requests.
- Completed collections.
- Recent collection activity.

Use simple statistic cards and tables/lists.

Avoid unnecessary analytics or complex charts.

## 5. Database Architecture

Use Supabase PostgreSQL.

Create the following tables.

### profiles

Stores user and organization information.

Fields:

- id: UUID, primary key, references auth.users.
- full_name: TEXT.
- email: TEXT.
- role: TEXT (donor, ngo, admin).
- organization_name: TEXT.
- organization_type: TEXT.
- phone: TEXT.
- city: TEXT.
- address: TEXT.
- verification_status: TEXT.
- created_at: TIMESTAMPTZ.
- updated_at: TIMESTAMPTZ.

### donations

Stores food donation listings.

Fields:

- id: UUID, primary key.
- donor_id: UUID, references profiles.
- title: TEXT.
- description: TEXT.
- category: TEXT.
- quantity: NUMERIC.
- quantity_unit: TEXT.
- food_type: TEXT.
- image_url: TEXT, nullable.
- prepared_at: TIMESTAMPTZ.
- safe_until: TIMESTAMPTZ.
- pickup_deadline: TIMESTAMPTZ.
- pickup_address: TEXT.
- city: TEXT.
- additional_instructions: TEXT.
- status: TEXT.
- assigned_ngo_id: UUID, nullable.
- created_at: TIMESTAMPTZ.
- updated_at: TIMESTAMPTZ.

### collection_requests

Stores NGO requests for donations.

Fields:

- id: UUID, primary key.
- donation_id: UUID, references donations.
- ngo_id: UUID, references profiles.
- requested_quantity: NUMERIC.
- message: TEXT, nullable.
- status: TEXT.
- created_at: TIMESTAMPTZ.
- updated_at: TIMESTAMPTZ.

### collection_records

Stores completed collection information.

Fields:

- id: UUID, primary key.
- donation_id: UUID, references donations.
- ngo_id: UUID, references profiles.
- donor_id: UUID, references profiles.
- collected_quantity: NUMERIC.
- collected_at: TIMESTAMPTZ.
- notes: TEXT, nullable.

Add appropriate indexes to frequently queried columns, especially:

- donations.status
- donations.donor_id
- donations.city
- donations.pickup_deadline
- collection_requests.donation_id
- collection_requests.ngo_id

Use database constraints and foreign keys wherever appropriate.

Use migrations to manage database schema changes. Do not make undocumented manual schema changes.

## 6. Security and Authorization

Security is important because the platform handles organization accounts and donation records.

Implement Supabase Row Level Security (RLS).

Rules:

- Users can read and update their own profiles.
- Users cannot change their own role to admin.
- Donors can create donations only for their own accounts.
- Donors can update only their own donations.
- NGOs can browse eligible available donations.
- NGOs can create collection requests only for themselves.
- NGOs can update or cancel only their own pending requests.
- Donors can accept or reject requests for their own donations.
- Only the assigned NGO can confirm collection.
- Admin operations must be restricted to verified admin identities.

Do not rely exclusively on frontend role checks.

Enforce authorization in database policies and server-side operations.

Validate all user inputs on the server using Zod.

Prevent unauthorized access to private organization information.

Never expose secret environment variables to browser code.

## 7. Application Structure

Use a clean Next.js App Router structure.

Suggested directory structure:

    src/
      app/
        (public)/
          page.tsx
          about/
          contact/
        
        (auth)/
          login/
          register/
          forgot-password/
        
        (dashboard)/
          donor/
            dashboard/
            donations/
            donations/new/
            donations/[id]/
            requests/
            history/
          
          ngo/
            dashboard/
            explore/
            donations/[id]/
            requests/
            collections/
          
          admin/
            dashboard/
            users/
            donations/
        
        api/
          webhooks/
      
      components/
        ui/
        layout/
        landing/
        donations/
        dashboard/
        forms/
      
      lib/
        supabase/
          client.ts
          server.ts
        validations/
        utils/
      
      types/
      
      actions/
      
    supabase/
      migrations/

Adapt this structure when necessary, but keep responsibilities separated.

Do not create unnecessary abstraction layers.

## 8. UI and Design Guidelines

The website should feel modern, clean, trustworthy, and approachable.

Design priorities:

- Mobile-first responsive design.
- Minimal and uncluttered interfaces.
- Clear visual hierarchy.
- Consistent spacing.
- Readable typography.
- Simple navigation.
- Accessible forms and controls.
- Fast loading and lightweight pages.

The landing page should explain:

1. What LastPlate does.
2. Why food waste is a problem.
3. How the donation process works.
4. Who can participate.
5. The impact of successful donations.
6. How organizations can get started.

Suggested landing page sections:

- Navbar with logo and navigation.
- Hero section with a clear headline.
- Primary CTA: Donate Surplus Food.
- Secondary CTA: Join as NGO.
- How It Works.
- Our Mission.
- Impact Statistics.
- Footer.

Use real food-related imagery only where it adds value.

Do not use excessive gradients, glassmorphism, animated backgrounds, or unnecessary decorative elements.

Avoid an obviously AI-generated website aesthetic.

Use reusable components and consistent design tokens.

## 9. Food Safety and Operational Rules

LastPlate is a coordination platform, not a food-safety certification authority.

Implement the following safeguards:

- Donors must confirm that listed food is suitable for donation.
- Require preparation time and safe-consumption deadline.
- Never display expired donations as available.
- Display pickup deadlines prominently.
- Do not allow collection requests after the safe-consumption deadline.
- Clearly display food type and allergen information when provided.
- Do not claim that listed food is safe merely because it is published.
- Encourage donors and NGOs to follow applicable local food-safety regulations.

Do not implement automatic food-safety certification.

## 10. Development Guidelines

Follow these rules throughout development:

1. Use TypeScript strictly.
2. Avoid using `any`.
3. Prefer Server Components by default.
4. Use Client Components only when interactivity requires them.
5. Keep business logic out of presentation components.
6. Reuse components where appropriate.
7. Use Server Actions for appropriate mutations.
8. Use Route Handlers for APIs and integrations.
9. Validate inputs on the server.
10. Handle loading, error, and empty states.
11. Provide useful error messages.
12. Use proper database constraints.
13. Avoid duplicate database queries.
14. Avoid unnecessary dependencies.
15. Keep code readable and maintainable.

Never hardcode credentials.

Use environment variables:

    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    SUPABASE_SERVICE_ROLE_KEY=

Keep the service role key server-side only.

Provide an `.env.example` containing placeholders, not real credentials.

## 11. Testing

Test the following critical workflows:

- Donor registration and login.
- NGO registration and login.
- Role-based access control.
- Donation creation.
- Donation editing and deletion where permitted.
- NGO donation discovery.
- Collection request creation.
- Donor accepting and rejecting requests.
- Preventing duplicate assignments.
- Collection confirmation.
- Expired donation handling.
- RLS enforcement.

Prioritize testing authorization and donation assignment logic.

## 12. Implementation Strategy

Build the application incrementally.

### Phase 1 — Foundation

- Initialize Next.js.
- Configure TypeScript and Tailwind.
- Set up Supabase.
- Create database migrations.
- Configure authentication.
- Implement protected routes.

### Phase 2 — Core Platform

- Implement donor and NGO profiles.
- Build donor dashboard.
- Build donation creation and management.
- Build NGO donation discovery.
- Implement collection requests.

### Phase 3 — Collection Workflow

- Implement request acceptance and rejection.
- Implement donation assignment.
- Implement pickup confirmation.
- Implement donation history.
- Implement expiration handling.

### Phase 4 — Polish

- Build landing page.
- Improve responsive layouts.
- Add dashboard statistics.
- Add empty, loading, and error states.
- Test complete workflows.
- Prepare Vercel deployment.

## 13. Scope Restrictions

This is an MVP.

Do not implement the following unless explicitly requested:

- Payment gateways.
- Subscription systems.
- AI-based food recommendations.
- Complex route optimization.
- Live GPS tracking.
- Real-time chat.
- Microservices.
- Separate backend servers.
- Complex analytics infrastructure.
- Mobile applications.
- Unnecessary third-party APIs.

Keep the architecture simple enough for a small development team to maintain.

## 14. Instructions to the Coding Agent

Before implementing a feature:

1. Inspect the existing project structure.
2. Understand the existing database schema.
3. Identify reusable components.
4. Check existing authentication and authorization logic.
5. Plan the smallest implementation that satisfies the requirement.

When implementing:

- Do not overwrite existing working functionality unnecessarily.
- Do not introduce duplicate components.
- Keep database migrations synchronized with application types.
- Ensure all database operations respect RLS.
- Follow existing naming conventions.
- Test the affected workflow before considering it complete.

After completing each major phase:

- Run TypeScript checks.
- Run linting.
- Run relevant tests.
- Fix errors before proceeding.
- Summarize what was implemented and what remains.

**Final principle: Build a simple, reliable platform that makes donating surplus food and collecting it through NGOs as easy as possible. Prioritize functionality, security, and usability over unnecessary technical complexity.**

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
