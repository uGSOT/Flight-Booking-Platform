// Airline reference data. `color` drives the small logo badge on flight cards.
export const AIRLINES = [
  { code: "AI", name: "Air India", color: "#d31f26" },
  { code: "IX", name: "Air India Express", color: "#e8763a" },
  { code: "9I", name: "Alliance Air", color: "#e63946" },
  { code: "6E", name: "IndiGo", color: "#2b3990" },
  { code: "SQ", name: "Singapore Air", color: "#f5a623" },
];

export const AIRLINES_BY_CODE = AIRLINES.reduce((acc, a) => {
  acc[a.code] = a;
  return acc;
}, {});
