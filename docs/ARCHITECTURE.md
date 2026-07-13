# AirMe — Flight Booking Platform · Architecture

> **Status:** Draft v1 · **Last updated:** 2026-07-13
> **Related docs:** [PRD](./PRD.md) · [Figma / Design Requirements](./FIGMA-DESIGN-REQUIREMENTS.md)

This document describes the technical architecture for **AirMe**: a plain-React
single-page app backed by **Supabase** (Backend-as-a-Service) with **Razorpay** for payments.

---

## 1. Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| **Language** | JavaScript (ES2022), **no TypeScript** | Per requirement — plain JS + JSX |
| **UI framework** | **React 18** (function components + hooks) | No Next.js — client-rendered SPA |
| **Build tool** | **Vite** | Fast dev server, ESM, code-splitting |
| **Routing** | React Router v6 | Route-level lazy loading |
| **Server state** | TanStack Query (React Query) | Caching, loading/error states for Supabase reads |
| **Client state** | React Context + hooks (Zustand optional) | Auth session, search params, booking draft |
| **Forms** | React Hook Form | Traveller / profile / search validation |
| **Styling** | CSS Modules or Tailwind CSS | Design tokens from Figma (see §7) |
| **Charts** | Recharts | Dashboard + admin reports |
| **BaaS** | **Supabase** | Postgres, Auth, Row Level Security, Storage, Edge Functions |
| **Payments** | **Razorpay** (sandbox) | INR/UPI/cards; verified via Edge Function + webhook |
| **Hosting (frontend)** | Vercel / Netlify (static) | SPA + env-injected Supabase keys |
| **Hosting (backend)** | Supabase cloud | DB + Edge Functions (Deno) |

**Why this stack:** Supabase gives auth, a relational DB with fine-grained RLS, file storage,
and serverless functions in one managed platform — no custom backend server to run. Razorpay
is the natural India/INR gateway (matches the ₹ + UPI mockups) and integrates cleanly with
Supabase Edge Functions for server-side order creation and signature verification.

> **Payment gateway — decided (PRD D2):** **Razorpay** is the committed gateway for v1 (INR +
> UPI matches the ₹ mockups). Stripe is **not** used. Because payment is isolated behind the
> `create-razorpay-order` / `razorpay-webhook` Edge Functions, a future gateway swap would be
> a backend-only change, but that is out of scope for v1.

---

## 2. High-level architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                           │
│  React + Vite · React Router · React Query · Recharts          │
│                                                                │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Auth ctx   │  │ Booking draft │  │ Feature pages/modules │  │
│  │ (mock OTP) │  │ (context)     │  │ search/book/admin/... │  │
│  └─────┬──────┘  └──────┬───────┘  └───────────┬───────────┘  │
│        │                │                       │              │
│        └────────────────┴───────────┬───────────┘              │
│                    supabase-js client │  Razorpay Checkout.js   │
└───────────────────────────┬──────────┴──────────┬──────────────┘
                             │ HTTPS (anon key +   │ hosted
                             │ user JWT)           │ checkout
                ┌────────────▼─────────────┐   ┌───▼───────────────┐
                │        SUPABASE           │   │     RAZORPAY      │
                │                           │   │   (sandbox)       │
                │  Auth  ·  Postgres + RLS  │   └───▲───────────────┘
                │  Storage · Edge Functions │       │ webhook +
                │                           │◄──────┘ order create
                │  Edge fns:                │
                │   • create-razorpay-order │
                │   • razorpay-webhook      │
                └───────────────────────────┘
```

The browser talks directly to Supabase for all authenticated CRUD (guarded by RLS). Payment is
the only flow that requires server-side secrets, so it goes through **Edge Functions** that
hold the Razorpay key secret and verify signatures.

---

## 3. Frontend architecture

### 3.1 Folder structure

```
src/
├── main.jsx                # app bootstrap, providers
├── App.jsx                 # router + layout shells
├── lib/
│   ├── supabase.js         # supabase-js client (anon key from env)
│   ├── auth.js             # auth service (mock OTP) — swappable
│   ├── razorpay.js         # checkout loader + order helper
│   └── format.js           # ₹ currency, dates, durations
├── context/
│   ├── AuthContext.jsx     # session, profile, role
│   └── BookingContext.jsx  # in-progress booking draft
├── hooks/                  # useFlights, useBookings, useReports, ...
├── components/             # design-system + shared UI (Button, Input, Modal, Table, ...)
├── features/
│   ├── landing/
│   ├── auth/               # LoginModal, OtpModal
│   ├── search/             # SearchWidget, TravelersDropdown
│   ├── results/            # Filters, ResultCard, FareModal
│   ├── booking/            # Stepper, TravellerForm, AddOns (Seat, Meals), Payment, Confirmation
│   ├── bookings/           # My Bookings list + detail
│   ├── profile/
│   ├── dashboard/          # overview + reports (charts)
│   └── admin/              # admin shell + overview/bookings/users/reports
├── routes/                 # route definitions + guards
└── styles/                 # tokens, globals
```

### 3.2 Routing & guards

- **Public:** `/`, `/search`, `/flights` (results). Auth is only required to *complete* a
  booking — search is open.
- **Protected (traveller):** `/booking/*`, `/bookings`, `/profile`, `/dashboard/*` — redirect
  to login modal if no session.
- **Admin:** `/admin/*` — requires session **and** `profile.role === 'admin'`; otherwise render
  the **Access Denied** screen.
- Guards read from `AuthContext`; routes are lazy-loaded per feature for smaller initial bundle.

### 3.3 State strategy

| State | Where | Lifetime |
|-------|-------|----------|
| Auth session + profile + role | `AuthContext` (from `supabase.auth`) | App |
| Search parameters | URL query params (`?from=DEL&to=BOM&…`) | Shareable / bookmarkable |
| Filters & sort on results | Local component state | Page |
| Booking draft (flight, fare, travellers, seat, meals, total) | `BookingContext` (+ `sessionStorage` so a refresh mid-flow survives) | Booking flow |
| Server data (flights, bookings, reports) | React Query cache | Cached w/ invalidation |

---

## 4. Supabase design

### 4.1 Authentication — Phone + Mock OTP

Per PRD §4.1, **v1 mocks the OTP** (no SMS provider). The mock is isolated in `lib/auth.js` so
the UI never knows the difference and it can be swapped for real Supabase Phone Auth later.

**Mock OTP flow (v1):**
1. User enters phone → `requestOtp(phone)` generates a random 6-digit code, stores
   `{ phone, code, expiresAt }` in memory (module scope), and calls
   `alert("Your AirMe OTP is 123456")`.
2. User copy-pastes the code → `verifyOtp(phone, code)` checks match + expiry.
3. On success, establish a Supabase session for that phone identity. Two implementation
   options behind the same interface:
   - **A (recommended for demo):** a `sign-in-with-phone` **Edge Function** using the Supabase
     **service-role** key to `admin.createUser` / find the user by phone and mint a session
     (magic-link/`generateLink` or a signed session). Keeps a real Supabase user + JWT so RLS
     works unchanged.
   - **B (simplest):** deterministic email shim — map phone → `+91XXXXXXXXXX@airme.local`
     and use `signInWithOtp`/password under the hood. Still a real Supabase user.
4. First-time phone → trigger auto-creates a `profiles` row (see §5.3).

**Future (real OTP):** replace `requestOtp`/`verifyOtp` bodies with
`supabase.auth.signInWithOtp({ phone })` and `verifyOtp({ phone, token, type: 'sms' })` plus an
SMS provider configured in Supabase Auth. No UI change.

> The 6-digit alert mock is **demo-only** and must be disabled/removed before any real launch.

### 4.2 Row Level Security (RLS)

RLS is **on for every table**. Core policies:

- `profiles`: a user can `select`/`update` **only their own** row (`auth.uid() = id`). Admins
  can `select` all.
- `bookings`, `booking_passengers`, `booking_addons`, `payments`: owner-only
  (`user_id = auth.uid()`) for `select`/`insert`/`update`; **admins** get read + status-update
  across all rows via a `is_admin()` helper.
- `flights`, `airlines`, `airports`, `fares`: **public read**, no client write (seeded /
  admin-managed).
- Admin checks use a `SECURITY DEFINER` function `is_admin()` reading `profiles.role`, avoiding
  recursive RLS.

### 4.3 Storage

- Bucket `assets` (public): airline logos, route images, offer banners.
- Optional bucket `avatars` (private, owner-scoped) if profile photos are added later.

### 4.4 Edge Functions (Deno)

| Function | Purpose | Secrets |
|----------|---------|---------|
| `create-razorpay-order` | Server-side create a Razorpay order for the booking amount; returns `order_id` | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| `razorpay-webhook` | Verify webhook signature; mark payment captured + booking `Confirmed` | `RAZORPAY_WEBHOOK_SECRET`, service-role key |
| `sign-in-with-phone` *(if using auth option A)* | Mint a Supabase session for a phone identity | service-role key |

---

## 5. Data model

### 5.1 ERD (logical)

```
airports ─┐
          ├─< flights >─ airlines
airports ─┘     │
                └─< fares (tier: saver/regular/flexi)

profiles (1) ──< bookings >── (1) flights
                   │  │
                   │  ├──< booking_passengers
                   │  ├──< booking_addons (seat / meal)
                   │  └──1 payments
```

### 5.2 Tables

**`airports`** — `iata` (PK, e.g. DEL), `city`, `name`, `country`.

**`airlines`** — `id` (PK), `code` (e.g. 6E), `name`, `logo_url`.

**`flights`** — `id`, `airline_id`→airlines, `flight_no` (6E-638), `from_iata`→airports,
`to_iata`→airports, `depart_time`, `arrive_time`, `duration_min`, `stops`, `refundable`.
*(Seeded/generated inventory — no live GDS.)*

**`fares`** — `id`, `flight_id`→flights, `tier` (`saver`|`regular`|`flexi`), `base_price`,
`cabin_baggage_kg`, `checkin_baggage_kg`, `free_seat` (bool), `free_meal` (bool),
`cancellation_fee`, `date_change_fee`, `recommended` (bool).

**`profiles`** — `id` (PK = `auth.users.id`), `phone` (unique), `first_name`, `last_name`,
`dob`, `gender`, `email`, `company_name`, `gstin`, `role` (`user`|`admin`, default `user`),
`created_at`.

**`bookings`** — `id` (PK), `ref` (e.g. `BK-2026-0042`, generated), `user_id`→profiles,
`flight_id`→flights, `fare_tier`, `trip_type` (`one_way`|`round`), `return_flight_id` (nullable),
`status` (`pending`|`confirmed`|`cancelled`), `base_amount`, `addons_amount`,
`discount_amount`, `total_amount`, `promo_code`, `created_at`.

**`booking_passengers`** — `id`, `booking_id`→bookings, `first_name`, `last_name`, `dob`,
`gender`, `passport_no` (nullable).

**`booking_addons`** — `id`, `booking_id`→bookings, `type` (`seat`|`meal`), `label` (e.g. `5A`,
`Vegan meal + beverage`), `amount`.

**`payments`** — `id`, `booking_id`→bookings, `razorpay_order_id`, `razorpay_payment_id`,
`amount`, `currency` (`INR`), `status` (`created`|`captured`|`failed`), `created_at`.

### 5.3 Key DB logic

- **Trigger** `on_auth_user_created` → insert a `profiles` row with the phone number.
- **`generate_booking_ref()`** → `BK-<year>-<zero-padded seq>`.
- Reporting relies on **SQL views** (e.g. `v_user_monthly_spend`, `v_admin_daily_revenue`,
  `v_route_stats`) so charts fetch pre-aggregated rows.

### 5.4 Search implementation

Search results are computed against `flights` + `fares` filtered by `from/to/date/class`.
Filtering (price, stops, airlines, time buckets, duration) and sorting are done **client-side**
on the fetched candidate set (per PRD §4.4) — the seed dataset is small enough that one query +
client filtering keeps the UI snappy.

---

## 6. Payment architecture

Card data never touches AirMe or Supabase — Razorpay's hosted **Checkout** collects it.

```
1. User clicks "Pay" (booking step 4)
2. Client → Edge fn `create-razorpay-order` (amount, booking_id)
3. Edge fn creates Razorpay order (secret key) → returns order_id
4. Client opens Razorpay Checkout with order_id + public key_id
5. User pays via UPI / card / netbanking on Razorpay
6a. Checkout success handler → optimistic "processing"
6b. Razorpay → `razorpay-webhook` (payment.captured)
7. Webhook verifies signature → payments.status='captured',
   bookings.status='confirmed'
8. Client polls / subscribes (Supabase Realtime) → Confirmation screen
```

- **Booking is only `confirmed` after server-side verification** (webhook signature), not on the
  client success callback alone — prevents spoofed confirmations.
- **Sandbox mode** uses Razorpay test keys; a `PAYMENTS_MOCK` flag can short-circuit to an
  instant "captured" for pure-UI demos.
- Refunds (on cancel) are **out of scope** for v1 — cancel is a status change only (PRD D4).

---

## 7. Design system & theming

- Tokens (color, spacing, radius, typography) from
  [Design Requirements §5](./FIGMA-DESIGN-REQUIREMENTS.md#5-global-design-system-figma-deliverable)
  as CSS variables / Tailwind config. Palette: navy primary (`#2B4C7E`-ish, per mockups) +
  neutrals; success green, warning amber, error red.
- Prices use **tabular numerals** and ₹ Indian grouping (`lib/format.js`).
- Component library built once (Button, Input, Select, DatePicker, Stepper, Modal, Table,
  Badge, Card, Toast, Skeleton, Chart wrappers) and reused across public / dashboard / admin.
- **Admin shell** reuses the system with a distinct sidebar treatment to avoid confusion.

---

## 8. Security & privacy

- **RLS everywhere**; admin access via `is_admin()` (`SECURITY DEFINER`), never client-trusted.
- **Secrets** (Razorpay secret, service-role key, webhook secret) live only in Edge Function
  env — never shipped to the browser. Client holds only the Supabase **anon** key + Razorpay
  **key_id** (public).
- **Phone number is PII** — never placed in URLs, query strings, or logs.
- **Payment verification** server-side; no raw card data stored anywhere in our stack.
- Cookie/consent defaults to declining non-essential (PRD NFR).
- The **mock OTP alert is demo-only** and must be removed before a real launch.

---

## 9. Environments & deployment

| Env | Frontend | Supabase | Razorpay |
|-----|----------|----------|----------|
| **Local** | Vite dev (`localhost:5173`) | Supabase local (CLI) or shared dev project | Test keys / `PAYMENTS_MOCK` |
| **Staging** | Vercel/Netlify preview | Supabase staging project | Test keys |
| **Prod** | Vercel/Netlify prod | Supabase prod project | Live keys (post-KYC) |

- Frontend env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID`.
- Edge Function secrets set via `supabase secrets set`.
- DB schema + seed managed via Supabase **migrations** (`supabase/migrations/*.sql`) and a
  `seed.sql` for the sample data in [PRD §5](./PRD.md#5-sample--seed-data).
- CI: lint + build on PR; deploy frontend on merge to `main`; `supabase db push` for migrations.

---

## 10. Non-functional implementation notes

| NFR | Approach |
|-----|----------|
| Performance | Route-level code splitting, React Query caching, indexed FK columns, pre-aggregated report views |
| Accessibility | Semantic components, focus management in modals (login/OTP/fare), keyboard-navigable OTP + seat map, AA contrast tokens |
| Responsive | CSS grid/flex + breakpoints (390 / 768 / 1200 / 1440); filters → bottom sheet on mobile; sticky booking CTA |
| Observability | Supabase logs for Edge Functions; client error boundary + toast on failures |
| Testing | Vitest + React Testing Library for components/hooks; happy-path booking flow as an integration test; RLS policy tests |

---

## 11. Key risks & mitigations

| Risk | Mitigation |
|------|------------|
| Mock OTP mistaken for real auth | Clearly demo-only; isolated in `lib/auth.js`; documented removal step |
| Client-only confirmation could be spoofed | Booking confirmed only via verified webhook |
| RLS misconfiguration leaks data | Policy tests; default-deny; `is_admin()` helper |
| Razorpay KYC/live-key delay | Ship on sandbox; `PAYMENTS_MOCK` fallback for demos |
| Report queries slow as data grows | SQL views + indexes; date-range bounded queries |
