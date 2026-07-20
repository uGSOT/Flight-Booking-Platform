// One-time demo data seeder. Populates the bookings store with realistic
// platform data so Dashboard, Reports and Admin have something to show.
// Guarded by a flag so it runs once. Not used once Supabase is wired.
import { AIRLINES } from "../data/airlines.js";
import { listBookings, saveBooking } from "./bookingsStore.js";

const SEED_FLAG = "airme.seeded.v1";

// Primary demo user — matches the login mockup number so this account looks rich.
export const DEMO_PHONE = "+919876543210";

const USERS = [
  { phone: DEMO_PHONE, name: "Priya Sharma" },
  { phone: "+919812345678", name: "Arjun Mehta" },
  { phone: "+919845012345", name: "Neha Gupta" },
  { phone: "+919898765432", name: "Rahul Verma" },
  { phone: "+919811122233", name: "Sana Khan" },
];

const ROUTES = [
  ["DEL", "BOM"], ["BOM", "DEL"], ["BLR", "DEL"], ["DEL", "BLR"],
  ["HYD", "BLR"], ["CCU", "DEL"], ["MAA", "BOM"], ["GOI", "BOM"], ["DEL", "HYD"],
];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

export function seedDemoData() {
  if (localStorage.getItem(SEED_FLAG)) return;
  if (listBookings().length > 0) { localStorage.setItem(SEED_FLAG, "1"); return; }

  const statuses = ["confirmed", "confirmed", "confirmed", "confirmed", "pending", "cancelled"];
  for (let i = 0; i < 34; i++) {
    const user = Math.random() < 0.55 ? USERS[0] : pick(USERS);
    const [from, to] = pick(ROUTES);
    const airline = pick(AIRLINES);
    const month = rnd(1, 7); // Feb–Aug 2026 window
    const day = rnd(1, 28);
    const depart = `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const depMin = rnd(5 * 60, 22 * 60);
    const stops = Math.random() < 0.6 ? 0 : Math.random() < 0.85 ? 1 : 2;
    const durationMin = rnd(80, 180) + stops * rnd(60, 140);
    const price = rnd(2800, 16500);
    const seatAmt = Math.random() < 0.5 ? 300 : 0;
    const mealAmt = Math.random() < 0.5 ? 450 : 0;
    const amount = price + seatAmt + mealAmt - 380;
    const [fn] = [`${airline.code}-${rnd(100, 999)}`];
    saveBooking({
      ref: `BK-2026-${String(1000 + i)}`,
      userPhone: user.phone,
      userName: user.name,
      flight: { airlineCode: airline.code, airlineName: airline.name, airlineColor: airline.color, flightNo: fn, depMin, arrMin: depMin + durationMin, durationMin, stops, price },
      returnFlight: null,
      trip: { from, to, depart, ret: "", tripType: "one_way", adults: rnd(1, 2), children: 0, infants: 0, cabin: "Economy" },
      passengers: [{ type: "Adult", firstName: user.name.split(" ")[0], lastName: user.name.split(" ")[1] || "", gender: "Other" }],
      contact: { email: "", phone: user.phone },
      seats: seatAmt ? [{ label: `${rnd(1, 30)}A`, amount: seatAmt }] : [],
      meals: mealAmt ? [{ label: "Veg meal", amount: mealAmt }] : [],
      amount,
      promoCode: "GIRUSH",
      discountAmount: 380,
      status: pick(statuses),
      createdAt: `2026-${String(month + 1).padStart(2, "0")}-${String(rnd(1, day)).padStart(2, "0")}T10:00:00.000Z`,
    });
  }
  localStorage.setItem(SEED_FLAG, "1");
}
