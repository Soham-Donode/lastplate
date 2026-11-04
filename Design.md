# DESIGN.md — LastPlate

## 1. Primary Design Reference

The root directory contains an image named `ref.png`.

**This image is the primary visual reference for the entire website.**

Before designing or implementing any page, the coding agent MUST inspect and understand `ref.png`.

The website should closely follow the visual language, layout aesthetics, spacing, proportions, colour usage, and component styling shown in this reference.

Do not treat this image as loose inspiration. Use it as the main design direction.

### What to take from ref.png

- Large rounded application container.
- Soft, pale grey-green background.
- White content surfaces.
- Deep, muted forest-green accents.
- Rounded sidebar with subtle borders.
- Clean horizontal top navigation.
- Generously spaced dashboard content.
- Rounded rectangular statistic cards.
- Minimal icons with consistent stroke weights.
- Subtle borders instead of heavy shadows.
- Balanced typography and whitespace.
- A sophisticated combination of white, grey, and green.

### Adaptation to LastPlate

The reference image shows a project-management dashboard.

Do NOT reproduce its project-management content or widgets.

Instead, translate its visual language into LastPlate's food donation platform.

For example:

| Reference element | LastPlate equivalent |
|---|---|
| Projects dashboard | Donation dashboard |
| Total Projects | Total Donations |
| Running Projects | Active Donations |
| Ended Projects | Completed Collections |
| Pending Projects | Pending Requests |
| Project Stats | Food Donation Activity |
| Project List | Recent Donations |
| Project Progress | Donation Impact |
| Tasks | Food Listings |
| Team | NGO Partners |

The objective is to make LastPlate look like a professionally designed application using the same design language.

---

## 2. Overall Design Philosophy

LastPlate should feel like a premium, thoughtfully designed web application.

The visual direction is:

**Modern SaaS + Minimal Editorial + Sustainability-inspired Interface.**

The website should communicate:

- Trust.
- Sustainability.
- Simplicity.
- Responsibility.
- Community.

The design must feel intentional, mature, and professionally crafted.

Take inspiration from the visual simplicity of Linear and the dashboard aesthetics shown in `ref.png`.

Do not directly copy other products.

### Core Principles

1. Minimal but not empty.
2. Modern but not trendy.
3. Rounded but not excessively playful.
4. Professional but approachable.
5. Functional rather than decorative.
6. Strong typography and clear hierarchy.
7. Consistent spacing and alignment.
8. Restrained use of colour.
9. Excellent mobile usability.

---

## 3. Strict Colour System

The entire website must use ONLY THREE COLOUR FAMILIES:

1. Black.
2. White and shades of grey.
3. Green and its shades.

No other colour families are allowed.

This restriction applies to:
- Backgrounds.
- Buttons.
- Text.
- Icons.
- Charts.
- Badges.
- Illustrations.
- Notifications.
- Hover states.
- All UI components.

Do not introduce blue, purple, pink, orange, red, or yellow.

### Primary colours

| Purpose | Hex |
|---|---|
| Primary black | #171717 |
| Pure black | #000000 |
| Primary white | #FFFFFF |
| Main background | #F0F1EF |
| Secondary background | #F7F7F6 |
| Subtle background | #ECEEEC |
| Borders | #E3E5E2 |
| Muted text | #858585 |
| Secondary text | #666666 |

### Green palette

| Purpose | Hex |
|---|---|
| Primary green | #456B50 |
| Dark green | #304F3A |
| Deep green | #365B43 |
| Muted green | #8FAE91 |
| Light green | #C7D4BD |
| Pale green | #E3EADF |
| Green surface | #EAF0E8 |

Use the reference image to guide the balance between these shades.

### Colour Distribution

The interface should predominantly use:

- White for content panels.
- Very light grey-green for the application background.
- Black and dark grey for typography.
- Muted forest green for primary actions and selected states.
- Pale green for subtle highlights.

Green should be noticeable but not overwhelming.

### Important Restrictions

- No gradients of different colours.
- No blue links.
- No red error messages.
- No colourful status badges.
- No multicoloured charts.
- No colourful emoji icons.

For error states, use dark text, neutral grey backgrounds, borders, and appropriate text labels.

For success states, use green.

The website must remain visually consistent with the three-colour-family restriction.

---

## 4. Application Shell

The overall application shell should closely resemble the composition shown in `ref.png`.

### Main application container

On desktop:

- Use a large rounded outer container.
- Apply a very light grey-green background.
- Maintain generous outer padding.
- Use approximately 24–30px corner radius.
- Keep the application visually separated from the browser background.
- Avoid unnecessary shadows.

The application should feel like a cohesive workspace.

### Sidebar

Use a persistent left sidebar on desktop.

Design characteristics:

- White or slightly translucent-looking surface.
- Subtle border.
- Rounded corners.
- Consistent internal padding.
- Logo at the top.
- Navigation grouped into logical sections.
- Small Lucide icons.
- Clearly highlighted active navigation item.

The sidebar should not be excessively wide.

Suggested width: 210–240px.

#### Donor navigation

- Dashboard
- My Donations
- Create Donation
- Collection Requests
- History
- Settings

#### NGO navigation

- Dashboard
- Explore Food
- My Requests
- Collections
- History
- Settings

Keep logout separate near the bottom when space permits.

### Top navigation

Follow the reference image's horizontal topbar.

Include:

- Page-level search where relevant.
- Notifications.
- User avatar or profile icon.
- Organization name.
- Account-related actions.

Keep the topbar compact and visually light.

Use a subtle bottom border or a separate rounded white surface.

---

## 5. Rounded Corner System

Rounded corners are an important part of the visual identity.

Use consistent rounded rectangular components.

| Component | Border radius |
|---|---:|
| Small controls | 7px |
| Input fields | 9px |
| Buttons | 9px |
| Navigation items | 9px |
| Cards | 14px |
| Large panels | 18px |
| Sidebar | 18px |
| Main application shell | 28px |
| Dialogs | 16px |

Avoid excessive pill-shaped components.

Buttons should generally be rounded rectangles, not capsules.

Maintain consistency across all pages.

---

## 6. Typography

Typography should be clean, modern, and understated.

### Font

Use Geist Sans or Inter.

Prefer Geist Sans if available.

Use one primary font family throughout the website.

### Typography hierarchy

Landing page:

- Hero heading: 52–64px desktop.
- Section heading: 32–40px.
- Supporting heading: 18–22px.
- Body text: 15–17px.

Dashboard:

- Page title: 30–36px.
- Section heading: 18–22px.
- Card heading: 15–17px.
- Main statistics: 40–52px.
- Body text: 14–15px.
- Metadata: 12–13px.

### Rules

- Use regular, medium, and semibold weights.
- Avoid making every heading bold.
- Maintain readable line heights.
- Use muted grey for secondary information.
- Use dark text for important information.
- Use tabular numbers for statistics.
- Avoid excessive uppercase labels.

The typography should resemble the clean dashboard typography in `ref.png`.

---

## 7. Dashboard Design

The dashboard is the most important visual component of the application.

It should closely follow the dashboard composition in `ref.png`.

### Desktop structure

Use:

- Left sidebar.
- Top navigation.
- Main dashboard heading.
- Short descriptive subtitle.
- Primary actions aligned to the right.
- Statistics cards.
- Main content grid.

### Dashboard header

Example:

Dashboard

"Manage donations, track collections, and make a difference."

Primary action:

+ Create Donation

### Statistics cards

Use four cards across the top on desktop.

Donor statistics:

1. Total Donations.
2. Active Donations.
3. Completed Collections.
4. Pending Requests.

NGO statistics:

1. Available Donations.
2. Active Requests.
3. Completed Collections.
4. Total Food Collected.

Design characteristics:

- White background for most cards.
- One optional dark green highlighted card.
- Large numerical value.
- Small descriptive label.
- Optional supporting text.
- Small circular arrow icon if appropriate.
- Rounded corners.
- Minimal borders and shadows.

Follow the proportions and visual balance of the reference image.

### Main dashboard content

Use a flexible grid inspired by `ref.png`.

Donor dashboard:

- Recent Donations.
- Donation Activity.
- Incoming Collection Requests.
- Donation Impact.

NGO dashboard:

- Available Food.
- Active Collection Requests.
- Recent Collections.
- Collection Statistics.

Do not force every widget into an equal-sized card.

Use different panel widths according to their importance.

### Charts

Charts should be simple and restrained.

Use only:
- Dark green.
- Muted green.
- Pale green.
- Grey.
- Black.

Avoid colourful chart libraries and unnecessary chart decorations.

Only show real database-backed statistics.

Never fabricate activity or impact numbers.

---

## 8. Donation Cards and Lists

Donation listings should follow the same rounded white-panel aesthetic.

Each donation card should display:

- Food image or small thumbnail.
- Food title.
- Food category.
- Quantity.
- Food type.
- Donor organization.
- Location.
- Pickup deadline.
- Availability status.
- Relevant action.

Use a clean layout with sufficient spacing.

Avoid displaying every piece of metadata with a separate icon.

### Status indicators

Use subtle backgrounds.

Examples:

- Available: pale green with dark green text.
- Requested: light grey with dark text.
- Accepted: muted green with dark green text.
- Completed: neutral green.
- Expired: grey.
- Cancelled: grey.

Always include a readable text label. Never communicate status using colour alone.

---

## 9. Forms and Donation Creation

Forms should feel like natural extensions of the dashboard.

Use white rounded panels against the pale application background.

Group the form into three sections:

### Food Details

- Food title.
- Description.
- Category.
- Food type.
- Quantity and unit.
- Optional image.

### Food Safety

- Preparation time.
- Safe-consumption deadline.
- Allergen information.

### Pickup Details

- Pickup address.
- City.
- Pickup deadline.
- Additional instructions.

### Input styling

- White background.
- Subtle grey border.
- 9px radius.
- Consistent height.
- Comfortable padding.
- Dark text.
- Green focus state.

Labels must be clearly visible above inputs.

Use helpful validation messages.

Avoid unnecessarily complicated form layouts.

On desktop, related fields may share a row.

On mobile, stack fields vertically.

---

## 10. Landing Page Design

The landing page should use the same design language as the dashboard.

It should not look like a completely different website.

### Navigation

- LastPlate logo.
- About.
- How It Works.
- Our Impact.
- Login.
- Get Started.

Use a minimal horizontal navbar.

### Hero Section

Suggested headline:

"Good food deserves a second chance."

Supporting text:

"Connecting restaurants, hostels and messes with NGOs to turn surplus food into meaningful meals."

Actions:

- Donate Surplus Food.
- Join as an NGO.

Use strong typography and restrained green emphasis.

A large, authentic food-related photograph can be used if it improves the composition.

Avoid:
- Gradient hero backgrounds.
- Floating decorative shapes.
- Random statistics.
- Excessive animations.
- Generic AI illustrations.

### How It Works

Show three simple steps:

1. List Surplus Food.
2. Connect with an NGO.
3. Collect and Distribute.

Use minimal icons and clean spacing.

### Impact Section

Display real platform statistics:

- Donations completed.
- Estimated food rescued.
- Participating organizations.

Follow the dashboard's typography and green palette.

### Footer

Keep the footer simple, clean, and consistent.

---

## 11. Buttons and Interactive Components

### Primary button

- Deep muted green background.
- White text.
- 9px radius.
- Medium font weight.
- Subtle hover transition.

### Secondary button

- White background.
- Dark text.
- Thin grey border.

### Ghost button

- Transparent background.
- Dark or muted text.
- Minimal hover background.

### Icon buttons

Use small circular or rounded-square buttons.

Follow the reference image's restrained icon-button styling.

### Inputs

Use consistent borders and focus states.

### Dialogs

- White background.
- Rounded corners.
- Subtle shadow.
- Clear hierarchy.
- Well-spaced actions.

### Dropdowns

- White background.
- Subtle grey border.
- Rounded corners.
- Minimal shadow.
- Consistent typography.

---

## 12. Icons and Imagery

Use Lucide React.

Icon rules:

- Consistent stroke weight.
- Mostly 16–20px.
- 20–24px for main navigation.
- Dark green or grey.
- No random icon decoration.
- No emoji as interface elements.

### Photography

Use authentic photography related to:

- Surplus food.
- Restaurants.
- Food preparation.
- Volunteers.
- Food collection.
- Community distribution.

Use images sparingly.

Avoid:
- Cartoon illustrations.
- 3D graphics.
- Generic AI-generated illustrations.
- Excessive decorative photographs.
- Unnecessary image backgrounds.

Photography should complement the interface, not dominate it.

---

## 13. Animations

Keep animations subtle and professional.

Suggested durations:

- Hover: 120–160ms.
- Buttons: 120–180ms.
- Dropdowns: 150–200ms.
- Dialogs: 180–220ms.

Use animations only when they improve feedback or navigation.

Avoid:

- Bouncing elements.
- Parallax.
- Animated backgrounds.
- Excessive scroll effects.
- Continuous decorative movement.

Respect reduced-motion preferences.

---

## 14. Responsive Design

The design must work exceptionally well on mobile.

Do not simply shrink the desktop dashboard.

### Desktop

- Full sidebar.
- Horizontal topbar.
- Multi-column statistics.
- Flexible content grid.
- Tables where appropriate.

### Tablet

- Collapsible sidebar.
- Two-column dashboard layout.
- Adaptive statistics cards.

### Mobile

- Compact header.
- Bottom navigation or a clean navigation drawer.
- Single-column content.
- Full-width primary actions.
- Stacked donation cards.
- Comfortable touch targets.
- Proper form spacing.

The desktop reference should guide the mobile adaptation, but usability must take priority.

---

## 15. Strict Anti-AI Design Rules

The website must not look like an automatically generated website template.

Avoid:

- Purple, blue, pink, orange, red, or yellow accents.
- Multicoloured gradients.
- Glassmorphism.
- Floating blobs.
- Random decorative shapes.
- Excessive pills.
- Excessive card layouts.
- Repetitive three-column sections.
- Generic AI illustrations.
- Excessive shadows.
- Fake testimonials.
- Fake impact statistics.
- Decorative charts with no real data.
- Oversized headings on every page.
- Unnecessary icons beside every heading.
- Unnecessary animations.

Prefer:

- Thoughtful whitespace.
- Consistent alignment.
- Strong typography.
- Restrained forest-green accents.
- White rounded panels.
- Subtle grey borders.
- Clean dashboard layouts.
- Authentic photography.
- Carefully considered component proportions.

---

## 16. Design Implementation Rules

Before implementing any UI:

1. Inspect `ref.png` in the project root.
2. Refer to this file.
3. Establish reusable design tokens.
4. Create consistent sidebar, topbar, card, button, and input components.
5. Follow the reference's layout proportions.
6. Adapt the layout to LastPlate's actual features.
7. Test desktop and mobile layouts.

Use CSS variables or Tailwind theme tokens for the colour palette.

Do not introduce arbitrary colours or inconsistent border radii.

Avoid duplicating component styles across pages.

When adding a new feature, use the existing design system rather than inventing a new visual style.

---

## 17. Final Quality Checklist

Before considering a page complete, verify:

- [ ] `ref.png` has been used as the primary visual reference.
- [ ] The page follows the reference's visual language.
- [ ] Only black, white, grey, and green colour families are used.
- [ ] Rounded corners are consistent.
- [ ] The background and panels have appropriate contrast.
- [ ] Typography is balanced.
- [ ] Spacing and alignment are consistent.
- [ ] There are no unnecessary decorative elements.
- [ ] Icons follow a consistent style.
- [ ] All dashboard statistics are real.
- [ ] All components work correctly.
- [ ] The page is responsive.
- [ ] The page feels like part of the same application.

## Final Design Direction

**Recreate the visual character of `ref.png` for LastPlate.**

The final website should feel like a refined, modern SaaS application with a soft grey-green workspace, white rounded panels, dark typography, muted forest-green accents, and carefully balanced layouts.

Do not blindly reproduce the reference's content. Reproduce its design quality, proportions, and visual language.

The result should feel professionally art-directed, understated, cohesive, and genuinely human-designed.

**Prioritize taste, consistency, and usability over visual complexity.**