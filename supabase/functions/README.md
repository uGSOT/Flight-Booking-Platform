# Edge Functions — Razorpay payments

Two Deno functions implement the server-side of the payment flow
([Architecture §6](../../docs/ARCHITECTURE.md#6-payment-architecture)):

| Function | Purpose | JWT |
|----------|---------|-----|
| `create-razorpay-order` | Creates a Razorpay order (holds the secret key) | verify (default) |
| `razorpay-webhook` | Verifies the webhook signature and confirms the booking | **--no-verify-jwt** |

## Flow

```
Pay (real mode) → client saves a PENDING booking
   → create-razorpay-order (amount, bookingRef)  → order_id
   → Razorpay Checkout (client, public key_id)
   → Razorpay → razorpay-webhook (payment.captured)
   → webhook verifies signature → bookings.status = 'confirmed' + payments row
   → Confirmation page polls until confirmed
```

The booking is only **confirmed by the verified webhook**, never by the client
callback alone.

## Deploy

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli), logged in and
linked to the project (`supabase link --project-ref <ref>`).

```bash
# 1. Set secrets (server-side only — never in the client bundle)
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx
supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxx
supabase secrets set RAZORPAY_WEBHOOK_SECRET=whsec_xxx
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

# 2. Deploy
supabase functions deploy create-razorpay-order
supabase functions deploy razorpay-webhook --no-verify-jwt
```

## Configure the webhook (Razorpay Dashboard → Settings → Webhooks)

- **URL:** `https://<project-ref>.functions.supabase.co/razorpay-webhook`
- **Active events:** `payment.captured` (optionally `order.paid`)
- **Secret:** the same value as `RAZORPAY_WEBHOOK_SECRET`

## Switch the app to real payments

In `.env`, set `VITE_PAYMENTS_MOCK=false` and restart the dev server. With the
flag `true` (default), the app simulates capture and writes a confirmed booking
directly — no functions needed.
