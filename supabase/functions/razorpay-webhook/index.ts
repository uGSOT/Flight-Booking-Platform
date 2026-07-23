// razorpay-webhook
// Receives Razorpay webhooks, verifies the signature, and on a successful
// capture marks the booking confirmed + records the payment. This is the
// AUTHORITATIVE confirmation — the client success callback alone is not trusted.
//
// Secrets (supabase secrets set ...):
//   RAZORPAY_WEBHOOK_SECRET
// Auto-injected by Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Configure in Razorpay Dashboard → Settings → Webhooks:
//   URL:    https://<project-ref>.functions.supabase.co/razorpay-webhook
//   Events: payment.captured  (and optionally order.paid)
//   Secret: same value as RAZORPAY_WEBHOOK_SECRET
//
// Deploy without JWT verification:  supabase functions deploy razorpay-webhook --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";

  const expected = await hmacHex(secret, body);
  if (!secret || expected !== signature) {
    return new Response("invalid signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("bad payload", { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity ?? {};
    const bookingRef = payment.notes?.booking_ref;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (bookingRef) {
      await supabase.from("bookings").update({ status: "confirmed" }).eq("ref", bookingRef);
      const { data: booking } = await supabase
        .from("bookings").select("id").eq("ref", bookingRef).maybeSingle();
      if (booking) {
        await supabase.from("payments").insert({
          booking_id: booking.id,
          razorpay_order_id: payment.order_id,
          razorpay_payment_id: payment.id,
          amount: Math.round((payment.amount ?? 0) / 100),
          currency: payment.currency ?? "INR",
          status: "captured",
        });
      }
    }
  }

  return new Response("ok", { status: 200 });
});
