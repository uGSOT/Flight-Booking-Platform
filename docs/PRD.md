# AirMe — Flight Booking Platform · Product Requirements Document (PRD)

> **Status:** Draft v1 · **Last updated:** 2026-07-13
> **Related docs:** [Architecture](./ARCHITECTURE.md) · [Figma / Design Requirements](./FIGMA-DESIGN-REQUIREMENTS.md)
> **Design source of truth:** `/mockups/*.png`

---

## 1. Overview

**AirMe** is a web-based flight booking platform where travellers search, compare, and
book domestic and international flights, then manage those bookings from a personal account.
The experience is modelled on consumer OTAs (MakeMyTrip, Cleartrip, Skyscanner) but scoped
to a capstone-project level: production-quality UI and a complete happy-path booking flow,
without the long tail of airline-industry edge cases.

The platform has three surfaces:

1. **Public / traveller app** — search, fare selection, booking, add-ons, payment, and
   booking management.
2. **User dashboard** — personal booking history, spend, and travel reports.
3. **Admin panel** — platform-wide bookings, users, and aggregate reporting (role-gated).

### 1.1 Product vision

> "Search, compare and book flights at the best prices" — *Your Journey, Elevated.*

A traveller should go from landing page to a confirmed booking in under two minutes, and be
able to return anytime to view or manage that booking.

### 1.2 Goals

| # | Goal | Measure |
|---|------|---------|
| G1 | Frictionless search-to-book | ≥ 1 completed booking in a session without leaving the flow |
| G2 | Trustworthy, transparent pricing | Fare + add-on breakdown visible before payment on every step |
| G3 | Self-service booking management | Users view / cancel bookings without support |
| G4 | Insightful reporting | Users and admins get charts + tables that load in < 2s on demo data |
| G5 | Frictionless phone-first onboarding | Sign-in via phone + mock OTP in < 20s |

### 1.3 Non-goals (v1 scope guardrails)

| In scope | Out of scope |
|----------|--------------|
| Web app (desktop-first, responsive) | Native iOS / Android apps |
| Phone + mock OTP (client-generated code) | Real SMS OTP, email/password, enterprise SSO |
| One-way & round-trip | Multi-city / complex itineraries |
| Domestic + basic international routes | Real airline GDS / live inventory |
| Real payment gateway (Razorpay) in sandbox | PCI-compliant card storage on our servers |
| Seat map + meals add-ons | Lounge, insurance, hotels, cabs |
| Charts & tables for reports | PDF / CSV export, emailed reports |
| Admin panel (read + status change) | Full CMS, audit logs, refunds engine |

---

## 2. Target users & personas

| Persona | Description | Primary goal |
|---------|-------------|--------------|
| **Casual traveller** (Priya Sharma) | Books 1–3 trips/year | Find a cheap flight fast and book it |
| **Frequent flyer** | Books monthly, often for work | Track spend, reuse traveller details, review history |
| **Business traveller** | Needs GST invoice | Add company GSTIN to bookings |
| **Platform admin** (Raj Mehta) | Operates the platform | Monitor revenue, bookings, users; update booking status |

---

## 3. Information architecture

```
Public
├── Landing (hero + search widget + popular routes + offers)
├── Auth (phone → OTP modal)
├── Search Results (filters + sort + result cards)
│   └── Choose Your Fare (modal, 3 fare tiers)
└── Booking flow (4 steps)
    ├── 1. Flight Selection
    ├── 2. Review & Traveller Details
    ├── 3. Add-ons (seat map + meals)
    └── 4. Payment → Confirmation

Authenticated (traveller)
├── My Account menu (My Profile, My Bookings, Support, Settings, Logout)
├── My Bookings (list + detail + cancel)
├── Profile (personal, contact, GSTIN)
└── Dashboard
    ├── Overview (stat cards, upcoming, recent)
    └── Reports (expense, travel history, booking stats)

Admin (role = admin)
├── Overview (KPIs + charts + recent bookings)
├── All Bookings (table, filters, status change)
├── Users (read-only list + detail)
└── Reports (Revenue | Bookings | Users | Routes)
```

**Role separation:** travellers never see admin links; `/admin/*` is gated on
`profiles.role = 'admin'`. Unauthorised access shows a 403 "Access denied" screen.

---

## 4. Feature requirements

Each feature lists **user stories** and **acceptance criteria (AC)**. Priority: **P0** = must
have for v1, **P1** = should have, **P2** = nice to have.

### 4.1 Authentication — Phone + Mock OTP · **P0**

The mockups use **phone-number login with an OTP** (no email/password). For v1 there is **no
real SMS provider** — the OTP is **mocked on the client**: on "Get OTP" we generate a random
**6-digit** code, show it to the user in a browser `alert()`, and let them copy-paste it into
the verify screen. This keeps the full auth UX without SMS cost or setup. See
[Architecture §4.1](./ARCHITECTURE.md#41-authentication-phone--mock-otp) for how the session
is actually created in Supabase.

**User stories**
- As a visitor, I enter my mobile number, get a 6-digit code shown in an alert, and paste it to
  sign in or auto-create my account.
- As a returning user, I stay signed in across sessions until I log out.

**Screens:** `Login.png` (enter number), `OPT.png` (verify OTP).

**AC**
- Login modal: country code selector (default `+91`) + phone input + **Get OTP** button.
- Invalid / incomplete number is blocked with inline validation before generating a code.
- On **Get OTP**: generate a random 6-digit code, hold it in memory (with the phone number and
  a short expiry), and surface it via `alert("Your AirMe OTP is 123456")` so the user can
  copy-paste it. (A dev convenience — clearly a demo, not production.)
- OTP screen shows the target number, **6** digit inputs, a **countdown** ("OTP will expire in
  00:24"), **Resend OTP** (regenerates + re-alerts; disabled until countdown ends), and
  **Change Number**.
- Entered code matches the generated code (and not expired) → Supabase session created;
  first-time numbers auto-create a `profiles` row.
- Incorrect / expired code → inline error, allow retry / resend.
- **Verify & Continue** returns the user to their pre-login context (e.g. resumes booking).
- Terms of Use / Privacy Policy links shown under the form.
- States: default, loading (button spinner), error, success.

> **Note:** The mock is isolated behind an auth service module so it can be swapped for real
> Supabase Phone Auth + an SMS provider later without touching the UI.

### 4.2 Landing page · **P0**

**Screen:** `main site.png`

**AC**
- Header: AirMe logo, **My Bookings**, **Support**, **Log In** (→ becomes **My Account**
  menu when signed in).
- Hero: headline "Your Journey, Elevated.", subcopy, and the **embedded search widget**.
- Search widget: One way / Round trip toggle · From · To (with swap) · Depart · Return
  (enabled only for round trip) · Travelers & Class · **Search Flights** CTA.
- **Popular searches** chips (DEL–BOM, DEL–HYD, BLR–BOM, DEL–BLR, BLR–CCU) prefill the search.
- **Popular Flight Routes**: 6 route cards (image, route, "From ₹x,xxx", duration, flights/day).
- **How it works**: Search → Compare → Book → Fly & Enjoy.
- **Best offers** strip (4 promo cards) — visual/promo only.
- **Why choose AirMe** (Best Price, 24/7 Support, Secure Booking, Easy Changes).
- **Trusted by 100+ Airlines** logo strip.
- Footer: Company / Supports / More link columns + social + copyright.

### 4.3 Flight search widget · **P0**

**User story:** As a traveller, I specify route, dates, travellers, and class, then search.

**Travelers & Class dropdown** (`DD.png`): steppers for **Adults (12+)**, **Children (2–12)**,
**Infants (< 2)**, plus class chips: **Economy**, **Premium Economy**, **Business Class**,
**First Class**.

**AC**
- Trip type toggle: **One way** (return disabled) / **Round trip** (return required).
- From / To autocomplete on city + IATA code (e.g. "Delhi (DEL)"); a **swap** control
  exchanges them.
- Depart date picker disables past dates; Return must be ≥ Depart.
- Adults default 1, minimum 1; infants ≤ adults.
- Validation errors: same origin & destination, missing required field, return before depart.
- **Search Flights** navigates to results carrying all parameters (URL query params).

### 4.4 Search results · **P0**

**Screens:** `Popular Flight Routes (One Way).png`, `Popular Flight Routes (Round Trip).png`

**Layout:** sticky search-summary bar (From/To, Depart, Return, Travelers & Class, **Edit
search**) + left **filter sidebar** + result cards. **Round trip** shows a two-column result
layout (outbound | return); one-way shows a single column.

**Filters (sidebar):**
| Filter | Control |
|--------|---------|
| Price range | Dual-handle slider (₹2,500–₹18,000) |
| Duration | Max-duration slider (1h–29h) |
| Stops | Checkboxes: Non-stop, 1 stop, 2+ (each with lowest price) |
| Airlines | Checkbox list w/ logo + lowest price |
| Departure time | Early morning / Morning / Afternoon / Evening / Night |
| Arrival time | Same buckets |
| **Reset all** | Clears all filters |

**Result card shows:** airline logo + name + flight no. (e.g. IndiGo 6E-638), depart time +
origin code + airport, duration + stops badge (Non-Stop), arrival time + dest code + airport,
fare, promo line ("₹380 OFF using GIRUSH code"), refundability badge (Partial Refundable),
**Book** + **View Details**.

**AC**
- Filtering and sorting are client-side and update the result count live.
- Sort options: Price ↑, Price ↓, Duration (shortest), Departure earliest / latest.
- States: loading (skeleton cards), results with count, no-results empty state with
  "adjust filters" hint, active-filter chips with clear-all.
- **Book** opens the **Choose Your Fare** modal; **View Details** expands itinerary/fare.

### 4.5 Choose Your Fare (modal) · **P0**

**Screen:** `Choose Your Fare.png`

**User story:** Before continuing, I compare fare tiers and pick one.

**AC**
- Header repeats the selected flight summary (airline, times, route, duration, stops).
- **Three fare cards** (e.g. ₹7,070 / ₹7,596 *Recommended* / ₹8,706 per adult), each listing:
  **Baggage** (cabin + check-in), **Flexible Options** (cancellation / date-change fees),
  **Change Seat** (chargeable vs free), **Meals** (paid vs free). Included = green check,
  excluded/chargeable = red.
- One card is marked **Recommended**; selecting a card highlights it and sets the price.
- Sticky footer shows running total + **Continue** → booking step 1.

### 4.6 Booking flow · **P0**

A **4-step** stepper persists across the flow: **1 Flight Selection → 2 Review & Traveller
Details → 3 Add-ons → 4 Payment**. A **Trip Summary** side panel (flight, times, baggage,
seat, meals, running total with promo) is visible from step 2 onward.

#### Step 2 — Review & Traveller Details (`Review & Traveller Details.png`)
- Flight summary strip + back link to Flight selection.
- **Traveller details** per passenger: First name, Last name, Date of birth, **Gender*** (req).
- **Contact details**: Email ID, **Phone number*** (req; prefilled from the logged-in profile).
- Sticky footer: running total + **Next**.
- **AC:** required fields validated inline; passenger count matches the travellers chosen in
  search; logged-in user's name/phone prefilled.

#### Step 3 — Add-ons (`Add-ons.png`)
- **Select Seat**: grid seat map (rows 1–7, cols A–F) with available / selected / occupied
  states; chosen seat reflected in Trip Summary (e.g. "5A").
- **Meals**: scrollable meal list with price and **Add**; **Veg Only** toggle filters the list;
  each add updates Trip Summary and total.
- Sticky footer: total + **Pay**.
- **AC:** seat and meals are optional; selections are additive to the fare and reflected in the
  summary and total in real time.

#### Step 4 — Payment · **P0**
- Payment via **Razorpay Checkout** (see [Architecture §6](./ARCHITECTURE.md#6-payment-architecture)).
  Methods: Card, UPI, netbanking (gateway-hosted — we never touch raw card data).
- Order amount = fare + seat + meals − promo, shown as a final breakdown before pay.
- **AC / states:** processing (spinner/modal), success → Confirmation, failure → error +
  retry. Payment is verified server-side (webhook / signature) before a booking is marked
  **Confirmed**.

#### Confirmation · **P0**
- Success state with booking reference (e.g. `BK-2026-0042`), flight + traveller + add-on
  summary, and payment summary.
- CTAs: **View Booking**, **Go to Dashboard**, **Book Another Flight**.

### 4.7 My Bookings · **P0**

**Entry:** header **My Bookings** / account menu.

**AC**
- Table (priority) / card list of bookings: Booking ID, Route, Date, Airline, Status, Amount,
  Actions. Status badges: **Confirmed**, **Pending**, **Cancelled**.
- Filters: status, date range, route search. Sort: date, amount. Pagination.
- **Booking detail** (drawer/page): full itinerary, travellers, add-ons, payment summary,
  status timeline (Booked → Confirmed), **Cancel booking** (danger + confirmation modal).
- Empty state: illustration + "No bookings yet" + CTA to search.

### 4.8 Profile & account · **P0**

**Screens:** `Profile.png`, account menu `DD-1.png` (My Profile, My Bookings, Support,
Settings, Logout).

**AC**
- **Personal details:** First name, Last name, Date of birth, **Gender*** .
- **Contact details:** Email ID, **Phone number*** (phone is the auth identity — read-only or
  re-verify to change).
- **GSTIN details (optional):** Company name, GSTIN number — used for business invoices.
- Logout confirmation. Settings screen is **P2**.

### 4.9 User dashboard & reports · **P1**

Per [Design Requirements §6.7–6.9](./FIGMA-DESIGN-REQUIREMENTS.md). Not in current mockups —
build to spec.

**Overview:** welcome header, 4 stat cards (Total bookings, Total spent, Upcoming trips,
Countries visited), next-trip card, recent bookings (last 3), quick "Search Flights".

**Reports:**
- **Expense summary:** date-range presets + custom; stat row (Total spent, Avg/trip, Highest);
  line chart (monthly spend), donut (spend by airline).
- **Travel history:** bar chart (trips/month) + table; export **disabled** ("Coming soon").
- **Booking stats:** horizontal bar (top routes) + stat cards (most-flown airline, favourite
  destination).
- States: loading skeletons, empty state per range.

### 4.10 Admin panel · **P1**

Per [Design Requirements §6.11](./FIGMA-DESIGN-REQUIREMENTS.md). Separate shell; desktop-first.

- **Overview:** KPIs (Total revenue, Total bookings, Active users, Cancellation rate) + daily
  revenue line + bookings-by-status bar + recent-10 table + date presets.
- **All Bookings:** full table (ID, User, Route, Depart, Airline, Status, Amount, Booked on),
  filters (status/date/airline/route/user search), row action **Update status** (Confirm /
  Cancel) with confirmation, booking detail drawer with user block.
- **Users:** read-only table (Name, Email/phone, Joined, Total bookings, Total spent, Role) +
  detail drawer with their booking history. No inline create / role edit in v1.
- **Reports:** tabbed **Revenue | Bookings | Users | Routes** with the charts/tables in the
  design doc; shared date-range control; export disabled.
- **Access denied** screen for non-admins hitting `/admin`.

---

## 5. Sample / seed data

Consistent placeholder data across all screens (also used to seed the demo DB):

| Field | Sample |
|-------|--------|
| User | Priya Sharma, +91 98765 43210 |
| Routes | DEL → BOM, BLR → GOI, HYD → CCU, DEL → HYD, KOL → DEL |
| Airlines | IndiGo, Air India, Air India Express, Alliance Air, SpiceJet, Vistara, Singapore Air |
| Flight no. | IndiGo 6E-638 |
| Prices | ₹2,899 – ₹18,500 |
| Promo | "₹380 OFF using GIRUSH code" |
| Booking ID | `BK-2026-0042` |
| Dates | June–August 2026 |
| Admin user | Raj Mehta, +91 90000 00001 (role = admin) |
| Platform stats | ₹4.2L revenue, 128 bookings, 47 users, top route DEL→BOM (34) |

Flight inventory is **seeded/generated** (no live GDS); results are computed from a `flights`
table + generated fares. See [Architecture §5](./ARCHITECTURE.md#5-data-model).

---

## 6. Non-functional requirements

| Area | Requirement |
|------|-------------|
| **Platform** | Web, desktop-first, responsive to 390px mobile |
| **Browsers** | Latest Chrome, Safari, Edge, Firefox |
| **Performance** | Search results interactive < 1.5s on seed data; charts < 2s; route-level code splitting |
| **Accessibility** | WCAG 2.1 AA: contrast, visible focus, 44px touch targets, labelled inputs, keyboard-navigable OTP + seat map |
| **Responsive** | Priority screens (Search, Results, Review & Pay, Bookings, Reports) fully mobile; filters in bottom sheet; sticky bottom CTA on booking steps. Admin desktop-first |
| **Security** | RLS on all user data; role-gated admin; payment verified server-side; no secrets in client; no card data stored |
| **Privacy** | Phone number is PII — never in URLs/logs; decline non-essential cookies by default |
| **i18n / currency** | INR (₹) with Indian digit grouping; tabular numerals for prices |
| **Empty / error / loading** | Every data view has all three states designed |

---

## 7. Release plan

| Phase | Scope |
|-------|-------|
| **M0 — Foundation** | Vite React app, Supabase project, phone OTP auth, design system / component library, layout shell, seed data |
| **M1 — Book a flight (happy path)** | Landing + search widget → results + filters → Choose Your Fare → 4-step booking → Razorpay sandbox → confirmation |
| **M2 — Manage bookings** | My Bookings (list/detail/cancel), Profile + GSTIN, account menu |
| **M3 — Insights** | User dashboard + reports (charts) |
| **M4 — Admin** | Admin shell, all bookings + status change, users, admin reports |
| **M5 — Polish** | Responsive passes, a11y audit, empty/error states, offers content |

---

## 8. Decisions (locked for v1)

All prior open questions are resolved. These are the committed decisions for v1:

| # | Topic | Decision |
|---|-------|----------|
| D1 | **OTP** | Phone login with a **client-generated 6-digit mock OTP** shown via `alert()` (copy-paste). No SMS provider in v1. Isolated in `lib/auth.js` so a real provider can drop in later with no UI change. |
| D2 | **Payment gateway** | **Razorpay** (sandbox/test keys) — INR, UPI, cards, netbanking via hosted Checkout. Order created and verified server-side in Supabase Edge Functions. Stripe is **not** used in v1. |
| D3 | **Round-trip pricing** | Outbound + return fares are **summed** into one booking total. No combined-fare products. |
| D4 | **Cancellation** | Cancel is a **status change only** (`confirmed → cancelled`). **No refund** is issued to Razorpay in v1. |
| D5 | **Promo codes** | **Fixed demo discount** ("₹380 OFF using GIRUSH code") applied as a flat `discount_amount`. No promo-code engine. |
| D6 | **Currency** | **INR (₹) only**, including international routes. Indian digit grouping + tabular numerals. |
| D7 | **"Countries visited" stat** | Derived from the **distinct countries of booked destination airports**. |
| D8 | **Flight inventory** | **Seeded / generated** in the `flights` + `fares` tables. No live GDS / airline API. |
| D9 | **Settings screen** | **Deferred (P2)** — account menu shows the link but v1 ships Profile only. |
| D10 | **Report export** | Export buttons are **visible but disabled** ("Coming soon"). No PDF/CSV in v1. |
