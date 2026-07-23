# Teaching Flow — Building AirMe End-to-End

> A teacher's guide to delivering the **AirMe Flight Booking Platform** as a
> project-based course. It explains *where to start*, *what to build in what
> order*, *how each piece integrates*, and *how to check understanding* at every
> step.
>
> Companion docs: [PRD](./PRD.md) · [Architecture](./ARCHITECTURE.md) ·
> [Database schemas](../schemas/README.md) · [Edge Functions](../supabase/functions/README.md)

---

## 0. How to use this guide

This is written for an instructor. Each **module** below follows the same rhythm:

- **🎯 Goal** — the one sentence a student should be able to say they achieved.
- **🧠 Concepts** — what you actually teach here (the transferable ideas).
- **🔨 Build** — what the student implements.
- **🔗 Integrates with** — how it connects to earlier/later work.
- **✅ Checkpoint** — how you (and they) know it works.
- **⚠️ Pitfalls** — where students get stuck, and how to unblock them.
- **🏋️ Stretch** — an optional exercise for fast learners.

**Golden rule of the course:** *always keep a running app.* Every module ends
with something the student can see in the browser. Never let them go more than
one session without a visible win — motivation on a big project comes from
seeing it grow.

**Suggested cadence:** ~10–12 sessions of 1.5–2 hours. Adjust freely; the
module boundaries are natural stopping points.

---

## 1. Set the destination before the journey

Before any code, spend one short session making the goal concrete.

1. **Demo the finished app** (or the mockups in [`/mockups`](../mockups)). Let
   them click through: search → results → fare → traveller details → add-ons →
   payment → confirmation, then the dashboard and admin panel.
2. **Read the PRD together** ([`docs/PRD.md`](./PRD.md)). Emphasise that
   professionals define *what* and *why* before *how*. Point out the "locked
   decisions" table — real projects freeze scope to stay shippable.
3. **Walk the architecture diagram** ([`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)).
   Don't explain every box yet — just plant the three-layer mental model:

   ```
   React app  ⇄  Supabase (DB + Auth + RLS + Functions)  ⇄  Razorpay
   ```

**Teaching note:** students remember a *story*. The story here is "a traveller
books a flight." Every feature you build is a scene in that story. Keep
returning to it.

---

## 2. The mental model you must instil early

Teach these four ideas in week one; everything else hangs off them.

| Idea | Plain-language version |
|------|------------------------|
| **Component tree** | The UI is a tree of functions that return HTML. Data flows *down*, events flow *up*. |
| **State vs. props** | Props are given to you; state is yours to change. When state changes, React re-draws. |
| **Client vs. server** | The browser can't be trusted with secrets or "who is allowed to do what." That lives on the server (Supabase). |
| **Source of truth** | Every piece of data has *one* home. Search params live in the URL; the booking-in-progress lives in a context; saved bookings live in the database. |

If a student is ever confused later, it's almost always because one of these
four blurred. Come back to the table.

---

## 3. Module map (the order that works)

Build **outside-in and happy-path-first**: the screens the user sees, wired with
fake data, then progressively make them real. This keeps the app runnable and
defers the hard integration work until students have context for it.

```
M1  Foundation & tooling        → an app that runs
M2  Design system & layout      → it looks like a product
M3  Landing + search widget     → the front door
M4  Search results + filters    → the first "real" interactive screen
M5  The booking flow (4 steps)  → the heart of the app (fake data)
M6  Authentication (mock OTP)   → who is the user?
M7  Account: bookings, profile  → persistence (local first)
M8  Dashboard & admin + charts  → reading data back as insight
M9  Supabase integration        → make the data real
M10 Payments (Razorpay)         → make money change hands (test mode)
M11 Production polish            → toasts, errors, loading, responsive
M12 Testing & deployment        → prove it works, ship it
```

Notice this is *exactly* the order the project was built in — it's a proven arc.
Each module below expands one row.

---

## M1 · Foundation & tooling

**🎯 Goal:** "I have a React app running locally that I can edit and see update."

**🧠 Concepts:** what a bundler/dev server is (Vite), the anatomy of a project
(`package.json`, `src/main.jsx` as the entry, `index.html` as the shell), hot
reload, npm scripts.

**🔨 Build:**
- Scaffold with Vite (`react` template, plain JS).
- Install the libraries you'll grow into: `react-router-dom`,
  `@tanstack/react-query`, `@supabase/supabase-js`, `recharts`.
- Delete the boilerplate; render a "Hello AirMe" heading.

**✅ Checkpoint:** `npm run dev`, edit the heading, see it change without reload.

**⚠️ Pitfalls:** Node version mismatches; students editing `dist/` instead of
`src/`. Show them the folder structure on day one.

**🏋️ Stretch:** Have them explain what each dependency is *for* before it's used.

---

## M2 · Design system & layout

**🎯 Goal:** "The app has a consistent look and a header/footer on every page."

**🧠 Concepts:** design tokens (colours, spacing, radius as CSS variables), why a
design system prevents chaos, CSS Modules for scoped styles, semantic layout.

**🔨 Build:**
- `src/styles/tokens.css` — the palette + spacing scale (derive it from the
  mockups; let students pick the exact hexes to build ownership).
- `src/styles/globals.css` — reset + base typography.
- A `SiteLayout` component (header with logo/nav, footer, `<Outlet/>`).
- A tiny reusable icon set (`components/icons.jsx`).

**🔗 Integrates with:** every future screen renders inside this layout.

**✅ Checkpoint:** two placeholder routes share the same header/footer.

**⚠️ Pitfalls:** students hardcoding colours instead of using tokens. Enforce
"no raw hex in components" as a rule — it pays off in M11 (theming, dark mode).

**🏋️ Stretch:** add a second theme by swapping token values only.

---

## M3 · Landing page & the search widget

**🎯 Goal:** "A visitor lands, fills a search form, and is taken to results."

**🧠 Concepts:** controlled inputs, component state (`useState`), lifting the
form's values into a submit handler, **the URL as state** (search params),
programmatic navigation.

**🔨 Build:**
- The hero + the search form (from/to, dates, trip type, travellers dropdown).
- On submit, encode the form into query params and navigate to `/flights?...`.
- Popular-route cards that deep-link into a search.

**🔗 Integrates with:** M4 reads exactly these query params.

**✅ Checkpoint:** submitting the form changes the URL and lands on a (stub)
results page carrying the right parameters.

**⚠️ Pitfalls:** the classic "why does my page reload?" — teach
`e.preventDefault()`. Also date inputs showing `dd/mm/yyyy`; a good moment to
discuss UX polish (placeholder trick).

**🏋️ Stretch:** validation — block same origin/destination, missing fields.

---

## M4 · Search results & client-side filtering

**🎯 Goal:** "I see a list of flights I can filter and sort instantly."

**🧠 Concepts:** rendering lists with `map` + keys, **derived state** (filtered
results computed from data + filter state, never stored twice), `useMemo`,
lifting filter UI into a sidebar, mock data generators.

**🔨 Build:**
- A **seeded mock flight generator** (`lib/mockFlights.js`) so results are
  stable per search — a great lesson in determinism and pure functions.
- The results layout: search summary bar, filter sidebar (price, stops,
  airlines, time), sort dropdown, result cards.
- Apply filters/sort *client-side* over the generated set.

**🔗 Integrates with:** in M9 the generator is swapped for a real DB query —
same component, different data source. Foreshadow this now.

**✅ Checkpoint:** toggling a filter changes the visible count immediately.

**⚠️ Pitfalls:** storing filtered results in state (goes stale). Teach "compute,
don't store." Missing `key` warnings — explain reconciliation.

**🏋️ Stretch:** add a "no results" empty state and a reset-filters action.

---

## M5 · The booking flow (the heart)

**🎯 Goal:** "I can go from a flight all the way to a confirmation screen."

This is the biggest module. Split it across sessions, one step at a time. Use a
**shared booking context** as the source of truth for the in-progress booking.

**🧠 Concepts:** multi-step flows, React Context for cross-page state, a
dedicated layout shell with a progress stepper, nested routes, form validation,
computed totals.

**🔨 Build (in this order):**
1. `BookingShell` — header with the 4-step stepper; derives the current step
   from the route.
2. **Choose Your Fare** modal — 3 tiers computed from a base price
   (`lib/fares.js`).
3. **Review & Traveller Details** — per-passenger forms + a reusable
   `TripSummary` side panel + a sticky `BookingFooter` with the running total.
4. **Add-ons** — a seat map (grid + seeded occupancy) and a meals list with a
   veg filter; totals update live.
5. **Payment** (fake for now) — method tabs + a price breakdown; on "pay,"
   fabricate a booking reference and go to **Confirmation**.

**🔗 Integrates with:** M6 gates the flow behind login; M9 persists the booking;
M10 replaces the fake payment.

**✅ Checkpoint:** a full click-through from results to a confirmation page
showing the booking reference and summary.

**⚠️ Pitfalls:** prop-drilling the booking through five screens — this is the
"aha" that motivates Context. Let them feel the pain for one screen *first*,
then introduce Context as the fix. Also: losing the draft on refresh → teach
persisting the context to `sessionStorage`.

**🏋️ Stretch:** support round-trip (two flight selections, summed fare).

---

## M6 · Authentication (phone + mock OTP)

**🎯 Goal:** "Only a logged-in user can complete a booking."

**🧠 Concepts:** auth as *identity + session*, why real OTP needs a provider,
**isolating an integration behind a module** so it can be swapped later, global
UI state (an auth modal openable from anywhere), route guards.

**🔨 Build:**
- `lib/auth.js` — a **mock OTP**: generate a 6-digit code, show it via `alert()`,
  verify it. Crucially, keep the *interface* (`requestOtp`, `verifyOtp`)
  identical to what a real provider would need.
- `AuthContext` (session) + `AuthModalProvider` (a login modal any button can
  open).
- Route guards: search is public; completing a booking requires login.

**🔗 Integrates with:** M9 replaces the mock's internals with a real Supabase
session — *without changing any UI*. This is the payoff of the module boundary.

**✅ Checkpoint:** clicking "Book" while logged out opens the login modal; after
verifying the alerted code, the flow resumes.

**⚠️ Pitfalls:** students entangling auth UI with auth logic. Teach the seam:
"the modal knows *how to ask*; `lib/auth.js` knows *how to verify*." Discuss
*why the alert is a demo shortcut* and must never ship — a good ethics moment.

**🏋️ Stretch:** a resend-OTP countdown and "change number" flow.

---

## M7 · Account area — persistence (local first)

**🎯 Goal:** "My bookings and profile survive a page reload."

**🧠 Concepts:** a **data-access layer** as an abstraction, `localStorage` as a
first backend, CRUD, list/detail/drawer patterns, confirming destructive
actions.

**🔨 Build:**
- `lib/bookingsStore.js` and `lib/profileStore.js` — save/list/get/update over
  `localStorage`. **This is the key design move:** components call these
  functions, never `localStorage` directly.
- My Bookings (table + detail drawer + cancel-with-confirmation).
- Profile (personal, contact, GSTIN).

**🔗 Integrates with:** M9 rewrites the *insides* of these store functions to hit
Supabase; components don't change. Say this out loud — it's the whole point.

**✅ Checkpoint:** create a booking, reload, still there; cancel it, status
updates.

**⚠️ Pitfalls:** reaching into `localStorage` from components (breaks the seam).
Reinforce the abstraction relentlessly here — it's what makes M9 painless.

**🏋️ Stretch:** filter/search the bookings table.

---

## M8 · Dashboard, reports & admin (data → insight)

**🎯 Goal:** "I can see charts and tables summarising the bookings."

**🧠 Concepts:** turning raw records into aggregates with **pure functions**,
composing a charting library (Recharts), role-based UI (admin vs. user),
tabbed/sectioned pages.

**🔨 Build:**
- `lib/analytics.js` — pure aggregation functions (spend by month, by airline,
  top routes, per-user activity, KPIs). *Pure functions are the star here* —
  easy to reason about and (foreshadow M12) easy to test.
- User Dashboard (stat cards, upcoming trip, reports with line/donut/bar charts).
- Admin shell (distinct look), overview KPIs, all-bookings table with status
  changes, users, and tabbed reports. Gate it on an admin role.
- A one-time **demo seeder** so charts aren't empty while teaching.

**🔗 Integrates with:** reads the same store from M7; in M9 the aggregations run
over real DB rows unchanged (pure functions don't care where data came from).

**✅ Checkpoint:** the dashboard shows non-empty charts; `/admin` is blocked for
non-admins.

**⚠️ Pitfalls:** putting aggregation logic *inside* components. Extract it to
`analytics.js` — cleaner, reusable, testable. Charts needing a peer dep
(`react-is`) is a realistic "read the error, fix the dependency" lesson.

**🏋️ Stretch:** add a date-range filter that recomputes every chart.

---

## M9 · Supabase integration (make the data real)

Now the app is fully functional on fake/local data — the perfect moment to
introduce a real backend, because students already understand *what* it must do.

**🎯 Goal:** "Data lives in a real Postgres database with proper access rules."

**🧠 Concepts:** Backend-as-a-Service, relational schema design, **migrations**
(versioned SQL run in order), **Row Level Security** (the server decides who
sees what), environment variables and secrets, async data + caching (React
Query).

**🔨 Build:**
- Design the schema *with* them from the PRD's data model, then write it as
  ordered SQL files ([`schemas/`](../schemas)). Teach why each file is numbered
  and idempotent.
- Turn on **RLS** and write policies: "a user sees only their own bookings;
  admins see all; reference tables are public-read." Have them try to break it.
- Wire `lib/supabase.js` (client) and rewrite the **insides** of the M7 store
  functions to call Supabase — components stay the same. Celebrate this.
- Swap the M6 mock auth to mint a *real* session (server-side helper), keeping
  the same UI.
- Point M4's search at the `flights`/`fares` tables (with a graceful fallback to
  the generator).

**🔗 Integrates with:** everything — this is where the three layers connect.

**✅ Checkpoint:** a booking made in the browser appears as a row in the Supabase
table editor; a second user can't see it.

**⚠️ Pitfalls:** secrets in the client bundle (teach the `VITE_` boundary and
that only public keys belong there); RLS locking *everything* out (teach
default-deny and reading the policy error); `import.meta.env` confusion;
CORS/redirect URLs on deploy. Budget extra time here — integration is where real
learning (and real debugging) happens.

**🏋️ Stretch:** add a reporting SQL *view* and read it from the app.

---

## M10 · Payments (Razorpay, test mode)

**🎯 Goal:** "A test payment goes through the real gateway and confirms a booking."

**🧠 Concepts:** never trusting the client with money, **server-side order
creation + signature-verified webhooks**, test vs. live keys, feature flags
(`PAYMENTS_MOCK`), serverless functions (Supabase Edge Functions / Deno).

**🔨 Build:**
- Load Razorpay Checkout, open it with the test key, complete a test payment
  (`success@razorpay` / test card).
- Explain the *proper* flow even if you demo the client-only shortcut: create an
  order in an Edge Function (secret stays server-side) → pay → a **webhook**
  verifies the signature and flips the booking to *confirmed*.
- Keep a `PAYMENTS_MOCK` flag so the app still runs without keys.

**🔗 Integrates with:** confirms the M5 booking and writes to the M9 database.

**✅ Checkpoint:** the Razorpay modal opens branded as AirMe, a test payment
succeeds, and the booking shows as confirmed.

**⚠️ Pitfalls:** thinking the client "success" callback is trustworthy — hammer
home that only the verified webhook confirms. KYC/live keys are out of scope;
stay in test mode.

**🏋️ Stretch:** deploy the two Edge Functions and register the webhook.

---

## M11 · Production polish

**🎯 Goal:** "The app feels finished: it never blanks out, always gives feedback."

**🧠 Concepts:** the states every async UI has (loading / empty / error /
success), user feedback (toasts), graceful failure (error boundary), responsive
design, accessibility and required-field affordances.

**🔨 Build:**
- A global **toast** system + wire success/error feedback into every action.
- An **error boundary** so a crash shows a friendly screen.
- **Loading skeletons** and **empty states** everywhere data is fetched.
- A **responsiveness pass** (mobile → desktop): test at 375px, fix the header,
  stack layouts, make tables scroll.

**✅ Checkpoint:** kill the network in dev tools — the app shows errors/toasts,
never a blank page. Resize to a phone — nothing overflows.

**⚠️ Pitfalls:** treating polish as optional. Frame it as "the difference
between a demo and a product." It's also where the design-token discipline from
M2 pays off.

**🏋️ Stretch:** dark mode via tokens; keyboard-navigate the whole booking flow.

---

## M12 · Testing & deployment

**🎯 Goal:** "I can prove the logic is correct and ship the app publicly."

**🧠 Concepts:** why we test pure logic first, unit tests, coverage as a *signal*
(not a goal in itself), CI-style gates, static hosting + SPA routing.

**🔨 Build:**
- **Jest** tests for the pure logic layer (`format`, `mockFlights`, `fares`,
  `analytics`, the stores). This is *why* M8 pushed logic into pure functions —
  now it's trivial to test. Set a coverage threshold and make it pass.
- **Deploy** to Vercel: environment variables, and the SPA rewrite
  (`vercel.json`) so deep links resolve. Add the deployed URL to Supabase's
  allowed URLs.

**✅ Checkpoint:** `npm run test:coverage` is green above threshold; the live URL
works, including a hard refresh on a deep route.

**⚠️ Pitfalls:** trying to unit-test the whole UI to hit a coverage number —
teach *what is worth testing* (logic) vs. what needs integration/E2E tests.
Missing env vars on the host (the app builds but can't reach Supabase).

**🏋️ Stretch:** add a couple of component tests with React Testing Library.

---

## 4. Cross-cutting habits to teach continuously

Weave these through every module, not as a separate lesson:

- **Small commits, clear messages.** Commit at every checkpoint. Show `git log`
  as a story of the build.
- **Read the error message first.** Most fixes are in the stack trace. Model
  this out loud when something breaks live.
- **One source of truth.** Repeat until reflexive.
- **Isolate integrations behind a module.** The mock-auth and store patterns are
  the clearest examples — point back to them.
- **Keep it runnable.** A broken `main` is a broken lesson.

---

## 5. Assessment ideas

- **Checkpoint demos:** at each module, the student screen-shares the working
  feature and explains *one* decision they made.
- **Bug-hunt:** you introduce a subtle bug (e.g., store filtered results in
  state); they find and explain it.
- **Extend it:** a graded feature the course didn't build — e.g. a "cancel with
  refund," seat-price-by-row, or a new report. This proves transfer.
- **Explain the seam:** ask them to describe how they'd swap Razorpay for
  another gateway, or `localStorage` for a different DB, touching the fewest
  files. If they can answer, they understood the architecture.

---

## 6. If you're short on time

A minimal but complete arc that still teaches the core ideas:

**M1 → M2 → M3 → M4 → M5 → M7 (local only) → M11 (light) → M12 (deploy).**

Skip M6/M9/M10 (real auth, DB, payments) or demo them read-only. Students still
build a full, deployed, polished SPA with real state management and a data-access
layer — the transferable skills — without the heavier backend integration.

---

## 7. One-paragraph philosophy

Teach this project the way it was built: **make it visible, make it work with
fakes, then make it real.** Every hard concept (Context, RLS, webhooks) is
introduced *after* the student already feels the problem it solves, so it lands
as a relief rather than a hurdle. Keep the traveller's story in the room, keep
`main` runnable, and let the app grow one satisfying checkpoint at a time.
