// Seeded mock flight generator. Produces a stable list of flights for a route
// so filters/sorting behave deterministically per search (no live GDS — PRD D8).
import { AIRLINES } from "../data/airlines.js";

// Tiny seeded PRNG (mulberry32) — stable output for a given seed string.
function makeRng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const between = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

/** Format minutes-from-midnight as "06:20". */
export function minutesToTime(min) {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Departure/arrival time bucket key for a minutes-from-midnight value. */
export function timeBucket(min) {
  const m = ((min % 1440) + 1440) % 1440;
  if (m < 8 * 60) return "early"; // 12 AM – 8 AM
  if (m < 12 * 60) return "morning"; // 8 AM – 12 PM
  if (m < 16 * 60) return "afternoon"; // 12 PM – 4 PM
  if (m < 20 * 60) return "evening"; // 4 PM – 8 PM
  return "night"; // 8 PM – 12 AM
}

const REFUNDABLE = ["Partial Refundable", "Partial Refundable", "Non Refundable", "Free Cancellation"];

/**
 * Generate a stable list of flights for a route.
 * @param {{from:string,to:string,depart:string,count?:number}} opts
 */
export function generateFlights({ from, to, depart, count = 16 }) {
  const rng = makeRng(`${from}-${to}-${depart}`);
  const flights = [];
  for (let i = 0; i < count; i++) {
    const airline = pick(rng, AIRLINES);
    const stops = rng() < 0.6 ? 0 : rng() < 0.8 ? 1 : 2;
    const depMin = between(rng, 5 * 60, 22 * 60);
    const baseDuration = between(rng, 80, 180);
    const durationMin = baseDuration + stops * between(rng, 60, 150);
    const price = between(rng, 2500, 18000);
    flights.push({
      id: `${airline.code}-${i}-${depMin}`,
      airlineCode: airline.code,
      airlineName: airline.name,
      airlineColor: airline.color,
      flightNo: `${airline.code}-${between(rng, 100, 999)}`,
      depMin,
      arrMin: depMin + durationMin,
      durationMin,
      stops,
      price,
      refundable: pick(rng, REFUNDABLE),
      promo: rng() < 0.7 ? "₹380 OFF using GIRUSH code" : null,
    });
  }
  return flights;
}
