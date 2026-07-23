// create-razorpay-order
// Creates a Razorpay order server-side (the secret key never reaches the client)
// and returns the order id + public key id for Razorpay Checkout.
//
// Secrets (supabase secrets set ...):
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
//
// Request body: { amount: number (INR), bookingRef: string, currency?: string }
// Response:     { orderId, keyId, amount (paise), currency }

import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { amount, bookingRef, currency = "INR" } = await req.json();
    if (!amount || !bookingRef) return json({ error: "amount and bookingRef are required" }, 400);

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) return json({ error: "Razorpay keys not configured" }, 500);

    const auth = btoa(`${keyId}:${keySecret}`);
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100), // paise
        currency,
        receipt: bookingRef,
        notes: { booking_ref: bookingRef },
      }),
    });

    const order = await res.json();
    if (!res.ok) return json({ error: order?.error ?? order }, 400);

    return json({ orderId: order.id, keyId, amount: order.amount, currency: order.currency });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
