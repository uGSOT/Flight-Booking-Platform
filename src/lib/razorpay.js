// Razorpay integration helper (PRD D2 / Architecture §6).
//
// Loads the hosted Checkout script on demand. Order creation + signature
// verification happen server-side in Supabase Edge Functions — the browser only
// holds the public key_id. A PAYMENTS_MOCK flag short-circuits for pure-UI demos.

import { supabase } from "./supabase.js";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
export const PAYMENTS_MOCK = import.meta.env.VITE_PAYMENTS_MOCK === "true";

let loaderPromise = null;

/** Lazily inject the Razorpay Checkout script. Resolves true when ready. */
export function loadRazorpay() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return loaderPromise;
}

/** Create a Razorpay order via the Edge Function. Returns { orderId, keyId, amount, currency }. */
export async function createOrder({ amount, bookingRef }) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
    body: { amount, bookingRef },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Could not create order.");
  return data;
}

/**
 * Open the hosted Checkout. Resolves on success handler, rejects on dismiss.
 * - Server-order mode (`order` provided): uses order_id; the webhook is the
 *   authoritative confirmation.
 * - Client-only mode (no `order`): launches Checkout with the public test key +
 *   amount. Suitable for test/demo; there is no server-side verification.
 */
export async function openCheckout({ order, amount, name = "AirMe", description, prefill }) {
  const ok = await loadRazorpay();
  if (!ok) throw new Error("Could not load the payment gateway.");

  const keyId = order?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) throw new Error("Razorpay key is not configured (VITE_RAZORPAY_KEY_ID).");

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      name,
      description,
      prefill,
      theme: { color: "#2b4c7e" },
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
    };
    if (order?.orderId) {
      options.order_id = order.orderId;
      options.amount = order.amount;
      options.currency = order.currency;
    } else {
      options.amount = Math.round((amount || 0) * 100); // paise
      options.currency = "INR";
    }
    new window.Razorpay(options).open();
  });
}
