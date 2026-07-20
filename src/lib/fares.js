// Build 3 fare tiers from a flight's base price (Choose Your Fare — PRD §4.5).
export function fareTiers(flight) {
  const base = flight.price;
  const rows = (seatFree, mealFree, checkin) => [
    { group: "Baggage", items: [{ ok: true, text: "7 Kgs Cabin Baggage" }, { ok: true, text: `${checkin} Kgs Check-in Baggage` }] },
    {
      group: "Flexible Options",
      items: [
        { ok: false, text: "Cancellation fee from ₹4,999 ( up to 4 hours before departure)" },
        { ok: false, text: "Date change fee from ₹4,999 ( up to 4 hours before departure)" },
      ],
    },
    { group: "Change Seat", items: [{ ok: seatFree, text: seatFree ? "Free Seats" : "Chargeable Seats" }] },
    { group: "Meals", items: [{ ok: mealFree, text: mealFree ? "Free Meals" : "Paid Meals" }] },
  ];
  return [
    { key: "saver", price: base, recommended: false, rows: rows(false, false, 15) },
    { key: "regular", price: Math.round(base * 1.074), recommended: true, rows: rows(true, true, 15) },
    { key: "flexi", price: Math.round(base * 1.231), recommended: false, rows: rows(true, true, 20) },
  ];
}
