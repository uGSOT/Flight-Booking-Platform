// AirMe auth service — Phone + MOCK OTP (PRD D1 / Architecture §4.1).
//
// v1 has NO SMS provider. `requestOtp` generates a random 6-digit code, holds it
// in memory with a short expiry, and surfaces it via alert() so the user can
// copy-paste it. `verifyOtp` checks the code, then establishes a session.
//
// This whole module is the swap point: to go live, replace the bodies of
// requestOtp/verifyOtp with supabase.auth.signInWithOtp / verifyOtp and configure
// an SMS provider. The UI never changes.
//
// ⚠️ DEMO ONLY — the alert() mock must be removed before any real launch.

import { supabase, isSupabaseConfigured } from "./supabase.js";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = 6;
const STORAGE_KEY = "airme.mockSession";

// In-memory pending OTP challenge: { phone, code, expiresAt }
let pending = null;

function generateCode() {
  let code = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

function normalizePhone(dialCode, phone) {
  const digits = String(phone).replace(/\D/g, "");
  return `${dialCode}${digits}`;
}

/**
 * Step 1 — generate + "send" an OTP. Returns the normalized phone identity.
 * In the mock, the code is shown via alert(); in production this is a no-op SMS send.
 */
export async function requestOtp({ dialCode = "+91", phone }) {
  const identity = normalizePhone(dialCode, phone);
  const code = generateCode();
  pending = { phone: identity, code, expiresAt: Date.now() + OTP_TTL_MS };

  // DEMO: surface the code so the user can copy-paste it.
  if (typeof window !== "undefined") {
    window.alert(`Your AirMe OTP is ${code}`);
  }
  return { phone: identity, ttlMs: OTP_TTL_MS };
}

/**
 * Step 2 — verify the code and establish a session.
 * Returns { user } on success; throws Error on invalid/expired code.
 */
export async function verifyOtp({ phone, dialCode = "+91", code }) {
  const identity = phone?.startsWith("+") ? phone : normalizePhone(dialCode, phone);

  if (!pending || pending.phone !== identity) {
    throw new Error("No OTP was requested for this number. Please resend.");
  }
  if (Date.now() > pending.expiresAt) {
    pending = null;
    throw new Error("OTP has expired. Please resend.");
  }
  if (String(code) !== pending.code) {
    throw new Error("Incorrect OTP. Please try again.");
  }
  pending = null;

  // TODO(real-auth): call the `sign-in-with-phone` Edge Function (Architecture §4.1
  // option A) to mint a real Supabase session. Until then, use a local mock session.
  if (isSupabaseConfigured && supabase) {
    // Placeholder for the real flow; kept as mock for v1 skeleton.
  }
  const user = { id: `mock-${identity}`, phone: identity };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return { user };
}

/** Return the current session's user, or null. */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function signOut() {
  pending = null;
  localStorage.removeItem(STORAGE_KEY);
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}
