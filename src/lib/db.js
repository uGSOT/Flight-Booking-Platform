// Supabase data-access layer for bookings and profiles.
// Falls back to the local stores when Supabase isn't configured, so the app
// still runs in demo mode without a backend.
import { supabase, isSupabaseConfigured } from "./supabase.js";
import * as localBookings from "./bookingsStore.js";
import * as localProfiles from "./profileStore.js";
import { generateFlights } from "./mockFlights.js";

export const useSupabase = isSupabaseConfigured && Boolean(supabase);

// ── Flight search ─────────────────────────────────────────────────────────
function timeToMin(t) {
  if (!t) return 0;
  const [h, m] = String(t).split(":");
  return Number(h) * 60 + Number(m);
}

function rowToFlight(row) {
  const airline = row.airline || {};
  const prices = (row.fares || []).map((f) => f.base_price).filter((n) => n != null);
  const price = prices.length ? Math.min(...prices) : 5000;
  const dep = timeToMin(row.depart_time);
  // Deterministic promo: ~70% of flights show the GIRUSH offer.
  const promo = (dep + price) % 10 < 7 ? "₹380 OFF using GIRUSH code" : null;
  return {
    id: row.id,
    airlineCode: airline.code,
    airlineName: airline.name,
    airlineColor: airline.color,
    flightNo: row.flight_no,
    depMin: dep,
    arrMin: dep + row.duration_min,
    durationMin: row.duration_min,
    stops: row.stops,
    price,
    refundable: row.refundable,
    promo,
  };
}

/** Search flights for a route. Falls back to generated flights when the DB has
 *  no inventory for the route (keeps the demo populated for any route). */
export async function searchFlights({ from, to, depart }) {
  if (!useSupabase || !from || !to) return generateFlights({ from, to, depart });
  const { data, error } = await supabase
    .from("flights")
    .select("id, flight_no, depart_time, arrive_time, duration_min, stops, refundable, airline:airlines(code,name,color), fares(base_price)")
    .eq("from_iata", from)
    .eq("to_iata", to);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return generateFlights({ from, to, depart });
  return data.map(rowToFlight);
}

// ── Bookings ────────────────────────────────────────────────────────────────
function rowToBooking(row) {
  // `details` holds the full app booking snapshot; scalar columns win where set.
  return { ...row.details, ref: row.ref, status: row.status, amount: row.total_amount, createdAt: row.created_at };
}

/** Persist a confirmed booking. Returns its generated reference. */
export async function saveBooking(app) {
  if (!useSupabase) return localBookings.saveBooking(app).ref;

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  const addons = (app.seats || []).concat(app.meals || []).reduce((s, x) => s + (x.amount || 0), 0);
  const details = { ...app, userName: app.userName || app.passengers?.[0]?.firstName ? `${app.passengers[0].firstName} ${app.passengers[0].lastName || ""}`.trim() : "Traveller" };

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      fare_tier: app.fareTier?.key ?? null,
      trip_type: app.trip?.tripType === "round" ? "round" : "one_way",
      cabin: app.trip?.cabin ?? "Economy",
      status: app.status ?? "confirmed",
      base_amount: app.fareTier?.price ?? app.flight?.price ?? 0,
      addons_amount: addons,
      discount_amount: app.discountAmount ?? 0,
      total_amount: app.amount ?? 0,
      promo_code: app.promoCode ?? null,
      details,
    })
    .select("ref")
    .single();
  if (error) throw new Error(error.message);
  return data.ref;
}

/** List bookings. RLS scopes: a user sees their own, an admin sees all.
 *  `phone` only scopes the local fallback (Supabase relies on RLS). */
export async function listBookings(phone) {
  if (!useSupabase) return localBookings.listBookings(phone ? { phone } : {});
  const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(rowToBooking);
}

export async function getBooking(ref) {
  if (!useSupabase) return localBookings.getBooking(ref);
  const { data, error } = await supabase.from("bookings").select("*").eq("ref", ref).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToBooking(data) : null;
}

export async function updateBookingStatus(ref, status) {
  if (!useSupabase) return localBookings.updateBookingStatus(ref, status);
  const { error } = await supabase.from("bookings").update({ status }).eq("ref", ref);
  if (error) throw new Error(error.message);
}

// ── Profiles ─────────────────────────────────────────────────────────────────
function rowToProfile(row) {
  if (!row) return null;
  return {
    firstName: row.first_name || "", lastName: row.last_name || "",
    dob: row.dob || "", gender: row.gender || "",
    email: row.email || "", phone: row.phone || "",
    company: row.company_name || "", gstin: row.gstin || "",
  };
}

export async function getMyProfile(fallbackPhone) {
  if (!useSupabase) return localProfiles.getProfile(fallbackPhone);
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  return rowToProfile(data);
}

export async function saveMyProfile(form) {
  if (!useSupabase) return localProfiles.saveProfile(form.phone, form);
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error("Not signed in.");
  const { error } = await supabase.from("profiles").update({
    first_name: form.firstName, last_name: form.lastName, dob: form.dob || null,
    gender: form.gender || null, email: form.email || null,
    company_name: form.company || null, gstin: form.gstin || null, phone: form.phone || null,
  }).eq("id", uid);
  if (error) throw new Error(error.message);
  return form;
}
