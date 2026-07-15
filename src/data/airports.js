// Airport reference data (IATA → city + full name). Used to resolve search params
// and render the search summary bar. Seed data only (PRD D8).
export const AIRPORTS = {
  DEL: { code: "DEL", city: "Delhi", name: "Indira Gandhi Intl. Airport" },
  BOM: { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Intl. Airport" },
  GOI: { code: "GOI", city: "Goa", name: "Dabolim Airport" },
  BLR: { code: "BLR", city: "Bengaluru", name: "Kempegowda Intl. Airport" },
  HYD: { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi Intl. Airport" },
  CCU: { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose Intl. Airport" },
  MAA: { code: "MAA", city: "Chennai", name: "Chennai Intl. Airport" },
};

const CITY_TO_CODE = Object.values(AIRPORTS).reduce((acc, a) => {
  acc[a.city.toLowerCase()] = a.code;
  return acc;
}, {});

/** Resolve a free-text query ("DEL", "Delhi", "delhi") to an airport object. */
export function resolveAirport(query) {
  if (!query) return null;
  const q = String(query).trim();
  const upper = q.toUpperCase();
  if (AIRPORTS[upper]) return AIRPORTS[upper];
  const code = CITY_TO_CODE[q.toLowerCase()];
  return code ? AIRPORTS[code] : { code: upper.slice(0, 3), city: q, name: "" };
}
