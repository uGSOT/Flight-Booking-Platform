## 1. Product Overview

Design a **personal flight management platform** where users can:

1. Search and compare flights
2. Book flights (with a simulated payment flow)
3. View and manage bookings
4. Generate reports on bookings, expenses, and travel history
5. *(Admin)* Monitor platform-wide bookings, revenue, and user activity via an admin reporting panel

Think **MakeMyTrip / Skyscanner** at a student-project scale: professional visual quality, but fewer edge cases and no over-engineered flows.

### What we are NOT building (scope guardrails)

| In scope | Out of scope |
|----------|--------------|
| Web app (desktop-first, responsive) | Native mobile apps |
| Supabase auth (email/password, optional Google) | Custom backend screens |
| Mock / sandbox payment UI | Real PCI-compliant payment forms |
| Charts & tables for reports | PDF export, email reports |
| Calendar-based date search | Multi-city / complex itineraries |
| One-way and round-trip flights | Hotels, trains, car rental |
| Admin panel with platform-wide reporting | Full CMS, role management, audit logs |

---

## 2. Design Principles

1. **Clarity over clutter** — One primary action per screen. Avoid dense airline-industry jargon.
2. **Trust through polish** — Clean typography, consistent spacing, subtle shadows, and clear price breakdowns.
3. **Data-friendly layouts** — Tables, filters, and charts must feel intentional, not bolted on.
4. **Frontend + Supabase aware** — Design for client-side filtering/sorting and Supabase-powered auth states (logged in / out, loading, empty).
5. **Accessible defaults** — WCAG AA contrast, visible focus states, 44px minimum touch targets on mobile.

---

## 3. Target Users

| Persona | Goal |
|---------|------|
| **Casual traveler** | Quickly find a cheap flight and book it |
| **Frequent flyer** | Track spending and review past trips in a dashboard |
| **Student / learner** | Understand booking status, filters, and report data at a glance |
| **Platform admin** | View all bookings, track revenue, and analyze platform usage via reports |

---

## 4. Information Architecture

```
├── Marketing / Landing
├── Auth
│   ├── Sign Up
│   ├── Log In
│   └── Forgot Password
├── Search & Results
│   ├── Flight Search (home)
│   ├── Search Results
│   └── Flight Detail
├── Booking Flow
│   ├── Passenger Details
│   ├── Review & Pay
│   └── Booking Confirmation
├── Dashboard (authenticated — user)
│   ├── Overview
│   ├── My Bookings
│   └── Reports
├── Admin Panel (authenticated — admin role only)
│   ├── Overview
│   ├── All Bookings
│   ├── Users
│   └── Reports
└── Account
    ├── Profile
    └── Settings (optional, low priority)
```

**Role separation:** Regular users see the user dashboard. Admins see a separate admin shell (distinct sidebar/nav) after login. Do not mix admin links into the public user navbar — access is role-gated via Supabase.

---

## 5. Global Design System (Figma deliverable)

Create a **Design System** page in Figma with the following. Keep the palette travel-inspired but restrained (2 brand colors + neutrals).

### 5.1 Color tokens

| Token | Usage |
|-------|--------|
| `primary` | CTAs, active nav, links |
| `primary-hover` | Button hover |
| `secondary` | Accents, badges |
| `background` | Page background |
| `surface` | Cards, modals, table rows |
| `border` | Dividers, input borders |
| `text-primary` | Headings, body |
| `text-secondary` | Labels, metadata |
| `success` | Confirmed bookings, payment success |
| `warning` | Pending, price changed |
| `error` | Form errors, failed payment |
| `info` | Informational banners |

### 5.2 Typography

| Style | Suggested use |
|-------|----------------|
| Display / H1 | Landing hero |
| H2 | Page titles |
| H3 | Section headers, card titles |
| Body | Default text |
| Body Small | Timestamps, airport codes |
| Label | Form labels, table headers |
| Price | Emphasized fare amounts (tabular nums) |

**Font suggestion:** Inter, Plus Jakarta Sans, or DM Sans (designer’s choice — document in Figma).

### 5.3 Spacing & layout

- **Grid:** 12-column, max content width **1200px** (dashboard), **960px** (forms)
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64
- **Border radius:** 8px (inputs), 12px (cards), 16px (modals)
- **Elevation:** 3 levels (flat, card, modal/dropdown)

### 5.4 Components (build as Figma components with variants)

| Component | Variants / states |
|-----------|-------------------|
| Button | Primary, Secondary, Ghost, Danger × Default, Hover, Disabled, Loading |
| Input | Text, Email, Password, Number × Default, Focus, Error, Disabled |
| Select / Dropdown | Single select |
| Date picker | Single date, date range (round-trip) |
| Checkbox / Radio | Default, checked, disabled |
| Badge | Confirmed, Pending, Cancelled, Cheapest, Fastest |
| Card | Flight card, stat card, booking card |
| Table | Header, row, row hover, empty state |
| Pagination | Page numbers + prev/next |
| Modal | Confirmation, payment processing |
| Toast / Alert | Success, error, info, warning |
| Avatar | With initials fallback |
| Navbar | Logged out, logged in |
| Sidebar | Dashboard navigation (desktop) |
| Tabs | Overview / Bookings / Reports |
| Skeleton loader | Card, table row, chart |
| Empty state | No bookings, no search results, no report data |
| Chart placeholders | Bar, line, donut (for reports) |
| Admin sidebar | Overview, Bookings, Users, Reports |
| Role badge | User, Admin |
| KPI stat card | Large number + trend arrow + period label |
| Date range filter bar | Presets + custom range (used in admin reports) |

**Admin visual distinction:** Reuse the same design system, but use a subtly different admin shell — e.g. darker sidebar or an “Admin” label in the nav — so admins never confuse admin vs user views.

---

## 6. Screen-by-Screen Requirements

### 6.1 Landing Page

**Purpose:** Orient the user and drive them to search or sign up.

**Must include:**
- Hero with headline, subcopy, and embedded **flight search widget** (same as search page)
- 3 feature highlights (Search, Book, Report)
- Simple “How it works” (3 steps)
- Footer with placeholder links

**Optional:** Social proof strip, illustration or abstract travel graphic.

**Primary CTA:** “Search Flights”  
**Secondary CTA:** “Sign Up” / “Log In”

---

### 6.2 Authentication

Supabase provides email/password auth. Design for these states:

#### Sign Up
- Full name, email, password, confirm password
- Terms checkbox
- Link to Log In
- Inline validation errors

#### Log In
- Email, password
- “Forgot password?” link
- Optional: “Continue with Google” button (Supabase OAuth)
- Link to Sign Up

#### Forgot Password
- Email field
- Success state: “Check your email”

**States to design:** Default, loading (button spinner), error banner, success.

---

### 6.3 Flight Search (Home)

**Purpose:** Calendar-based search — core interaction of the app.

**Search form fields:**

| Field | Type | Notes |
|-------|------|-------|
| From | Airport/city autocomplete | Show IATA code + city name in results |
| To | Airport/city autocomplete | Swap button between From/To |
| Trip type | Toggle | One-way / Round-trip |
| Departure date | Calendar picker | Disable past dates |
| Return date | Calendar picker | Only if round-trip; must be ≥ departure |
| Passengers | Stepper or dropdown | Adults (default 1), optional children |
| Class | Dropdown | Economy, Premium Economy, Business |

**CTA:** “Search Flights” (full width on mobile)

**Below fold (optional):** Recent searches, popular routes — use placeholder data.

**Empty / validation states:**
- Same origin and destination
- Missing required fields
- Return date before departure

---

### 6.4 Search Results

**Purpose:** Filterable, sortable list of flights. This screen demonstrates **complex data filtering**.

**Layout (desktop):**
- Left sidebar (~280px): filters
- Main area: sort bar + flight result cards
- Top sticky bar: condensed search summary with “Modify search”

**Flight result card — show:**
- Airline logo placeholder + name
- Departure → arrival time, duration
- Stops (Non-stop / 1 stop / 2+ stops)
- Origin & destination airport codes
- Price (prominent)
- “Select” or “View details” CTA
- Optional badges: Cheapest, Fastest, Morning departure

**Filters (sidebar):**

| Filter | Control |
|--------|---------|
| Price range | Dual-handle slider |
| Stops | Checkboxes: Non-stop, 1 stop, 2+ |
| Airlines | Checkbox list |
| Departure time | Morning / Afternoon / Evening / Night |
| Duration | Max duration slider |

**Sort options (dropdown):**
- Price: Low to High
- Price: High to Low
- Duration: Shortest
- Departure: Earliest
- Departure: Latest

**States:**
- Loading (skeleton cards)
- Results found (show count: “24 flights found”)
- No results (empty state + suggestion to change filters)
- Filter chips showing active filters with clear-all

---

### 6.5 Flight Detail (optional modal or page)

**Purpose:** Confirm flight choice before booking.

**Show:**
- Full itinerary timeline (vertical)
- Fare breakdown: base fare, taxes, total
- Baggage / cabin class summary (static copy)
- “Continue to Book” CTA

---

### 6.6 Booking Flow

#### Step 1 — Passenger Details
- Progress indicator (Step 1 of 3)
- Pre-filled user name/email if logged in
- Per passenger: Full name, gender, date of birth, passport number (optional for demo)
- Contact: phone, email
- “Continue” CTA

#### Step 2 — Review & Pay
- Progress indicator (Step 2 of 3)
- Flight summary card (collapsed itinerary)
- Passenger list
- Price breakdown table
- **Payment section (mock UI — no real gateway):**
  - Payment method tabs: Card / UPI (visual only)
  - Card: number, expiry, CVV, name on card
  - “Pay ₹X,XXX” CTA
- Terms checkbox

#### Step 3 — Confirmation
- Progress indicator (Step 3 of 3) — complete
- Success illustration/icon
- Booking reference ID (e.g. `BK-2026-0042`)
- Flight + passenger summary
- CTAs: “View Booking”, “Go to Dashboard”, “Book Another Flight”

**Payment states to design:**
- Processing (modal with spinner)
- Success → redirect to confirmation
- Failed → error message + retry

---

### 6.7 Dashboard — Overview

**Purpose:** Personal flight management hub. Authenticated users only.

**Layout:**
- Top navbar with logo, nav links, user avatar menu
- Left sidebar (desktop) / bottom nav (mobile): Overview, My Bookings, Reports

**Overview widgets:**

| Widget | Content |
|--------|---------|
| Welcome header | “Hello, {name}” |
| Stat cards (4) | Total bookings, Total spent, Upcoming trips, Countries visited |
| Upcoming flight | Next booking card with countdown or date |
| Recent bookings | Mini table or list (last 3) |
| Quick action | “Search Flights” button |

---

### 6.8 My Bookings

**Purpose:** Manage all bookings with filtering.

**Features:**
- Table or card list view toggle (table is priority)
- Columns: Booking ID, Route, Date, Airline, Status, Amount, Actions
- Status badges: Confirmed, Pending, Cancelled
- Filters: Status, date range, route (search)
- Sort: Date, amount
- Row action: “View details”
- Pagination

**Booking detail (drawer or page):**
- Full itinerary
- Passengers
- Payment summary
- Status timeline (Booked → Confirmed)
- “Cancel booking” (danger, with confirmation modal)

**Empty state:** Illustration + “No bookings yet” + CTA to search

---

### 6.9 Reports

**Purpose:** Visualize travel history, expenses, and booking analytics.

**Layout:** Tabbed or sectioned page.

#### Section A — Expense Summary
- Date range picker (This month, Last 3 months, This year, Custom)
- Stat row: Total spent, Avg per trip, Highest single booking
- **Line chart:** Monthly spending trend
- **Donut chart:** Spend by airline (or by route)

#### Section B — Travel History
- **Bar chart:** Trips per month
- Table: Date, Route, Airline, Amount, Status
- Export button (disabled / “Coming soon” — visual only)

#### Section C — Booking Stats
- **Horizontal bar chart:** Top routes
- Small stat cards: Most flown airline, favorite destination

**States:** Loading skeletons for charts, empty state when no data in range.

**Chart style notes:**
- Use brand colors; keep grids and axes subtle
- Show tooltips on hover (design 1 example)
- Include legend where needed

---

### 6.10 Profile / Account (low priority)

- Display name, email (read-only)
- Change password section
- Log out button

---

### 6.11 Admin Panel

**Purpose:** Platform-wide visibility for admins — all bookings, users, and aggregate reporting. Separate from the user dashboard; desktop-first (admin reporting is impractical on small screens — design desktop only, with a simplified read-only mobile view optional).

**Access:** Shown only when the logged-in user has an `admin` role (Supabase custom claim or `profiles.role` field). Unauthorized users who hit `/admin` see a 403 / “Access denied” screen.

**Layout:**
- Fixed left sidebar (~240px): Overview, All Bookings, Users, Reports
- Top bar: page title, global date range filter (applies to reports), admin avatar + “Exit to site” link
- Main content area: max width 1400px

---

#### 6.11.1 Admin — Overview

**Purpose:** At-a-glance platform health.

**KPI stat cards (4):**

| Card | Metric |
|------|--------|
| Total revenue | Sum of confirmed booking amounts (period) |
| Total bookings | Count all statuses |
| Active users | Users with ≥1 booking in period |
| Cancellation rate | % cancelled vs total |

**Widgets:**
- **Line chart:** Daily revenue (last 30 days)
- **Bar chart:** Bookings by status (Confirmed, Pending, Cancelled)
- **Recent bookings table:** Last 10 — Booking ID, User, Route, Date, Amount, Status
- Quick links to All Bookings and Reports

**Date filter:** Presets — Today, Last 7 days, Last 30 days, This month, Custom range

---

#### 6.11.2 Admin — All Bookings

**Purpose:** Manage and inspect every booking on the platform.

**Features:**
- Full-width data table (priority over cards)
- Columns: Booking ID, User (name + email), Route, Departure date, Airline, Status, Amount, Booked on, Actions
- Filters: Status, date range, airline, route search, user search (by name/email)
- Sort: Date, amount, status
- Bulk actions (optional, low priority): Export CSV (disabled / “Coming soon”)
- Row actions: View details, Update status (dropdown: Confirm / Cancel)

**Booking detail (drawer or page):**
- Same fields as user booking detail, plus **user info** block
- Admin action: Change status with confirmation modal
- Read-only payment summary

**Empty state:** “No bookings yet” (unlikely in prod — still design it)

---

#### 6.11.3 Admin — Users

**Purpose:** View registered users and their booking activity.

**Features:**
- Table: Name, Email, Joined date, Total bookings, Total spent, Role, Actions
- Role badge: User / Admin
- Filters: Role, joined date range, search by name/email
- Sort: Joined date, total spent, booking count
- Row action: View user detail

**User detail (drawer or page):**
- Profile summary
- Mini stat row: Bookings, Total spent, Last booking date
- User’s booking history table (subset of All Bookings)

**Note:** No inline user creation or role editing in v1 — read-only list with optional “View” only. Keeps scope simple.

---

#### 6.11.4 Admin — Reports

**Purpose:** Platform-wide analytics — the admin counterpart to the user Reports page (Section 6.9), with aggregate data across all users.

**Layout:** Tabbed page — Revenue | Bookings | Users | Routes

##### Tab A — Revenue
- Date range picker (shared with overview)
- Stat row: Total revenue, Avg booking value, Revenue growth % (vs previous period)
- **Line chart:** Revenue over time (daily / weekly toggle)
- **Bar chart:** Revenue by airline
- **Table:** Top 10 bookings by amount — ID, User, Route, Amount, Date

##### Tab B — Bookings
- Stat row: Total bookings, Confirmed, Pending, Cancelled
- **Donut chart:** Bookings by status
- **Bar chart:** Bookings per day/week
- **Table:** Bookings by airline — Airline, Count, Revenue, Avg fare

##### Tab C — Users
- Stat row: Total users, New users (period), Users with bookings, Avg bookings per user
- **Line chart:** New user signups over time
- **Bar chart:** Top users by spend (top 10)
- **Table:** User activity — Name, Bookings, Spent, Last active

##### Tab D — Routes
- Stat row: Total unique routes, Most popular route, Avg fare (top route)
- **Horizontal bar chart:** Top 10 routes by booking count
- **Table:** Route breakdown — Route, Bookings, Revenue, Avg fare

**Shared report controls (top of page):**
- Date range presets + custom
- “Apply” button (or auto-apply on change — note in design)
- Export button (disabled / “Coming soon”)

**States:** Loading skeletons for all charts/tables, empty state when no data in selected range, error banner on fetch failure.

**Chart style:** Match user Reports (Section 6.9) for consistency — same colors, tooltip style, and axis treatment.

---

#### 6.11.5 Admin — Access Denied

- Simple centered message: “You don’t have permission to view this page”
- CTA: “Go to Dashboard” or “Back to Home”

---

## 7. Responsive Breakpoints

Design **desktop (1440px)** and **mobile (390px)** for these priority screens:

1. Flight Search
2. Search Results
3. Booking — Review & Pay
4. Dashboard Overview
5. My Bookings (table → stacked cards on mobile)
6. Reports
7. Admin Overview (desktop priority)
8. Admin Reports (desktop priority)

**Mobile patterns:**
- Filters open in bottom sheet or full-screen drawer
- Sticky bottom CTA on booking steps
- Hamburger or bottom tab navigation for dashboard

---

## 8. Interaction & Micro-copy

### Loading
- Skeleton loaders for search results, tables, charts
- Button loading spinners on submit actions

### Empty states
- Friendly copy + single CTA per empty state
- Example: “No flights match your filters. Try adjusting your price range.”

### Error states
- Inline field errors + optional top banner for API/auth failures
- Example: “Payment failed. Please check your card details and try again.”

### Confirmation modals
- Cancel booking
- Log out
- Admin: update booking status

---

## 9. Sample Data for Realistic Mockups

Use consistent placeholder data across all screens:

| Field | Sample |
|-------|--------|
| User | Priya Sharma, priya@email.com |
| Routes | DEL → BOM, BLR → GOI, HYD → CCU |
| Airlines | IndiGo, Air India, SpiceJet, Vistara |
| Prices | ₹3,200 – ₹18,500 |
| Booking ID | BK-2026-0042 |
| Dates | June–August 2026 |
| Admin user | Raj Mehta, admin@skybook.com |
| Platform stats | ₹4.2L revenue, 128 bookings, 47 users |
| Top route | DEL → BOM (34 bookings) |
