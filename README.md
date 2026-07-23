# ✈️ AirMe — Flight Booking Platform

> Your Journey, Elevated. Search, compare and book flights at the best prices.

AirMe is a full-stack flight booking web app: travellers search and compare flights,
book them through a 4-step flow with seat & meal add-ons and payment, and manage
everything from a personal dashboard. Admins get a separate panel with platform-wide
bookings, users, and analytics.

Built with **plain React (JS) + Vite**, **Supabase** (Postgres, Auth, RLS, Edge
Functions), and **Razorpay** for payments.

- **Design & requirements:** [`docs/PRD.md`](docs/PRD.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Database:** [`schemas/`](schemas/) · **Edge Functions:** [`supabase/functions/`](supabase/functions/)

---

## ✨ Features

**Traveller**
- Phone + OTP login (mock OTP for the demo — no SMS needed)
- Flight search (one-way & round-trip) with live filters (price, duration, stops, airlines, time) and sorting
- "Choose Your Fare" (Saver / Regular / Flexi) with a 4-step booking flow
- Add-ons: seat map + in-flight meals
- Razorpay payment (test mode) → booking confirmation
- My Bookings (view, cancel), Profile with GSTIN details
- Personal Dashboard: spend & travel reports (charts)

**Admin** (role-gated)
- Overview KPIs + revenue/bookings charts
- All bookings (with status changes), users, and tabbed reports

**Production touches**
- Global toasts, error boundary, confirm dialogs, loading skeletons
- Form validation, responsive (mobile → desktop), accessible defaults

---

## 🧱 Tech stack

| Layer | Tech |
|-------|------|
| UI | React 19 + Vite (plain JS/JSX), CSS Modules |
| Routing / data | React Router, TanStack Query |
| Charts | Recharts |
| Backend | Supabase — Postgres, Auth, Row Level Security, Storage, Edge Functions (Deno) |
| Payments | Razorpay Checkout (+ order/webhook Edge Functions) |
| Hosting | Vercel (SPA) + Supabase cloud |

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project (free tier is fine)
- A [Razorpay](https://razorpay.com) account for **test** keys (optional — a mock mode works without it)

### 1. Install
```bash
npm install
```

### 2. Configure environment
Copy the example and fill in your keys:
```bash
cp .env.example .env
```
```ini
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx   # (or the anon key)
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
VITE_PAYMENTS_MOCK=true    # true = simulate payments; false = launch real Razorpay Checkout
```
> `.env` is gitignored. If Supabase isn't configured, the app runs in a self-contained
> local-storage demo mode with seeded data.

### 3. Set up the database
Run the SQL files in [`schemas/`](schemas/) **in numeric order** (Supabase → SQL Editor,
or `psql`). See [`schemas/README.md`](schemas/README.md) for details. They create the
tables, RLS policies, functions, views, storage buckets, and seed reference data +
flight inventory.

### 4. Run
```bash
npm run dev
```
Open the printed localhost URL.

---

## 🔑 Auth, admin & payments

### Logging in (mock OTP)
Enter any 10-digit number → **Get OTP** → a browser **alert shows a 6-digit code** →
paste it → **Verify**. No SMS is sent.

To create a real Supabase session without email confirmation, deploy the `ensure-user`
Edge Function (recommended) — see [`supabase/functions/README.md`](supabase/functions/README.md):
```bash
supabase functions deploy ensure-user --no-verify-jwt
```

### Becoming an admin
Log in once (creates your profile), then in the SQL Editor:
```sql
update public.profiles set role = 'admin' where phone = '+91XXXXXXXXXX';
```
Then visit **`/admin`**. (Demo admin numbers `+919000000001` / `+910000000000` also work.)

### Payments
- `VITE_PAYMENTS_MOCK=true` → payment is simulated and the booking is confirmed instantly.
- `VITE_PAYMENTS_MOCK=false` → real Razorpay Checkout launches. Test credentials:
  UPI `success@razorpay`, or card `4111 1111 1111 1111` (any future expiry/CVV).
- For server-verified payments, deploy `create-razorpay-order` + `razorpay-webhook`
  and set the secrets (see the functions README).

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with Oxlint |

---

## 🗂️ Project structure

```
Flight-Booking-Platform/
├── docs/                 # PRD + architecture
├── schemas/              # Sequential SQL migrations (001–011) + README
├── supabase/functions/   # Deno Edge Functions (ensure-user, razorpay-*)
├── mockups/              # Figma design references
├── src/
│   ├── components/       # Shared UI (Modal, Toaster, ConfirmDialog, layouts, icons…)
│   ├── context/          # Auth, AuthModal, Booking providers
│   ├── data/             # Airports, airlines, meals reference data
│   ├── features/         # landing, auth, results, booking, bookings, profile, dashboard, admin
│   ├── lib/              # supabase, db (data layer), auth, razorpay, analytics, toast…
│   ├── routes/           # Route guards
│   └── styles/           # Design tokens + globals
├── .env.example
└── vercel.json           # SPA rewrite for deep links
```

---

## ☁️ Deployment (Vercel)

1. Import the repo into Vercel (framework: **Vite**).
2. Add the `VITE_*` env vars in **Project → Settings → Environment Variables**.
3. Add your Vercel URL to **Supabase → Authentication → URL Configuration**.
4. `vercel.json` already rewrites all routes to `index.html` so deep links work.

---

## 🧭 Roadmap / status

- ✅ End-to-end booking flow (search → fare → traveller → add-ons → payment → confirmation)
- ✅ Dashboard, reports & admin panel
- ✅ Supabase auth, RLS, DB-backed search; Razorpay test-mode checkout
- ⏳ Server-verified payments (deploy the Razorpay Edge Functions)
- ⏳ Real SMS OTP (swap the mock in `src/lib/auth.js`)

---

<sub>Built as a capstone project. Design references live in [`mockups/`](mockups/).</sub>
