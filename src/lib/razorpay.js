// Razorpay integration helper (PRD D2 / Architecture §6).
//
// Loads the hosted Checkout script on demand. Order creation + signature
// verification happen server-side in Supabase Edge Functions — the browser only
// holds the public key_id. A PAYMENTS_MOCK flag short-circuits for pure-UI demos.

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
