// AirMe auth service — Phone + MOCK OTP with a REAL Supabase session.
//
// v1 has NO SMS provider. `requestOtp` generates a random 6-digit code and shows
// it via alert() (dev convenience). `verifyOtp` checks the code, then signs the
// user into Supabase using a deterministic phone→email shim so a real session +
// JWT exists and RLS works (Architecture §4.1, option B).
//
// ⚠️ DEMO ONLY. Replace requestOtp/verifyOtp with supabase.auth.signInWithOtp /
// verifyOtp + an SMS provider to go live. Requires "Confirm email" to be OFF in
// Supabase Auth settings for the shim signup to return a session.

import { supabase, isSupabaseConfigured } from "./supabase.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_LENGTH = 6;
const STORAGE_KEY = "airme.mockSession"; // fallback session when Supabase is off

let pending = null; // { phone, code, expiresAt }

function generateCode() {
  let code = "";
  for (let i = 0; i < OTP_LENGTH; i++) code += Math.floor(Math.random() * 10);
  return code;
}

function normalizePhone(dialCode, phone) {
  const digits = String(phone).replace(/\D/g, "");
  return `${dialCode}${digits}`;
}

// Deterministic Supabase credentials derived from the phone identity.
function shimCredentials(identity) {
  const digits = identity.replace(/\D/g, "");
  return { email: `u${digits}@airme.app`, password: `airme:${digits}:v1` };
}

/** Step 1 — generate + "send" an OTP (mock: shown via alert). */
export async function requestOtp({ dialCode = "+91", phone }) {
  const identity = normalizePhone(dialCode, phone);
  const code = generateCode();
  pending = { phone: identity, code, expiresAt: Date.now() + OTP_TTL_MS };
  if (typeof window !== "undefined") window.alert(`Your AirMe OTP is ${code}`);
  return { phone: identity, ttlMs: OTP_TTL_MS };
}

/** Step 2 — verify the code and establish a session. Returns { user }. */
export async function verifyOtp({ phone, dialCode = "+91", code }) {
  const identity = phone?.startsWith("+") ? phone : normalizePhone(dialCode, phone);

  if (!pending || pending.phone !== identity) throw new Error("No OTP was requested for this number. Please resend.");
  if (Date.now() > pending.expiresAt) { pending = null; throw new Error("OTP has expired. Please resend."); }
  if (String(code) !== pending.code) throw new Error("Incorrect OTP. Please try again.");
  pending = null;

  if (isSupabaseConfigured && supabase) {
    const { email, password } = shimCredentials(identity);

    // Preferred: ensure a pre-confirmed user exists server-side (no email sent).
    let ensured = false;
    try {
      const { error: fnErr } = await supabase.functions.invoke("ensure-user", { body: { phone: identity } });
      ensured = !fnErr;
    } catch {
      ensured = false; // function not deployed — fall back below
    }

    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (ensured) {
        // User was just created/repaired but sign-in failed — surface the real error.
        throw new Error(error.message);
      }
      // Fallback (no ensure-user function): client signup, needs "Confirm email" OFF.
      const signUp = await supabase.auth.signUp({ email, password, options: { data: { phone: identity } } });
      if (signUp.error) throw new Error(signUp.error.message);
      data = signUp.data;
      if (!data.session) {
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (retry.error || !retry.data.session) {
          throw new Error("Could not start a session. Deploy the ensure-user Edge Function (recommended), or turn OFF \"Confirm email\" in Supabase → Authentication → Email.");
        }
        data = retry.data;
      }
    }
    // Ensure the profile carries the phone (the signup trigger can't read it).
    const uid = data.user?.id;
    if (uid) await supabase.from("profiles").update({ phone: identity }).eq("id", uid);
    return { user: { id: uid, phone: identity } };
  }

  // Fallback (Supabase not configured): local mock session.
  const user = { id: `mock-${identity}`, phone: identity };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return { user };
}

/** Current session user, or null. Async because Supabase is the source of truth. */
export async function getSessionUser() {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    const s = data.session;
    return s ? { id: s.user.id, phone: s.user.user_metadata?.phone || null } : null;
  }
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
  if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
}
