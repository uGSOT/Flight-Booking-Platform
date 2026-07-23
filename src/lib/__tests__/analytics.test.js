import {
  userStats, monthlySpend, tripsPerMonth, spendByAirline, topRoutes,
  adminStats, bookingsByStatus, revenueByAirline, usersActivity,
} from "../analytics.js";

// Fixtures crafted to exercise every branch:
// - mixed statuses (confirmed/pending/cancelled)
// - a bad depart date (monthKey → null)
// - a booking with no airline (→ "Other")
// - a user whose first booking has no userName (→ "Traveller")
const bookings = [
  { ref: "1", userPhone: "+91a", userName: "A", status: "confirmed", amount: 5000, trip: { from: "DEL", to: "BOM", depart: "2026-08-10" }, flight: { airlineName: "IndiGo" } },
  { ref: "2", userPhone: "+91a", userName: "A", status: "confirmed", amount: 3000, trip: { from: "DEL", to: "BOM", depart: "2026-06-05" }, flight: { airlineName: "IndiGo" } },
  { ref: "3", userPhone: "+91b", userName: "B", status: "cancelled", amount: 4000, trip: { from: "BLR", to: "DEL", depart: "2026-07-25" }, flight: { airlineName: "Air India" } },
  { ref: "4", userPhone: "+91b", status: "pending", amount: 2000, trip: { from: "HYD", to: "BLR", depart: "2026-05-15" }, flight: { airlineName: "Vistara" } },
  { ref: "5", userPhone: "+91c", userName: "C", status: "confirmed", amount: 6000, trip: { from: "DEL", to: "BOM", depart: "bad-date" }, flight: {} },
  { ref: "6", userPhone: "+91d", status: "confirmed", amount: 1000, trip: { from: "MAA", to: "GOI", depart: "2026-09-01" }, flight: { airlineName: "SpiceJet" } },
];

describe("userStats", () => {
  it("summarises a user's bookings", () => {
    const s = userStats(bookings);
    expect(s.totalBookings).toBe(6);
    expect(s.totalSpent).toBe(17000);   // excludes the cancelled ₹4000
    expect(s.upcoming).toBe(2);          // depart >= 2026-07-20 (ref1, ref6)
    expect(s.destinations).toBe(3);      // BOM, BLR, GOI
    expect(s.avgPerTrip).toBe(3400);     // 17000 / 5 active
    expect(s.highest).toBe(6000);
  });
  it("handles an empty list", () => {
    const s = userStats([]);
    expect(s).toMatchObject({ totalBookings: 0, totalSpent: 0, upcoming: 0, destinations: 0, avgPerTrip: 0, highest: 0 });
  });
});

describe("monthlySpend / tripsPerMonth", () => {
  it("aggregates by month, skipping invalid dates", () => {
    const spend = monthlySpend(bookings);
    // May, Jun, Aug, Sep (the bad-date booking is skipped)
    expect(spend.map((x) => x.month)).toEqual(["May", "Jun", "Aug", "Sep"]);
    expect(spend.find((x) => x.month === "Aug").value).toBe(5000);
    const trips = tripsPerMonth(bookings);
    expect(trips).toHaveLength(4);
    expect(trips.every((t) => t.count === 1)).toBe(true);
  });
  it("returns [] for no bookings", () => {
    expect(monthlySpend([])).toEqual([]);
    expect(tripsPerMonth([])).toEqual([]);
  });
});

describe("spendByAirline", () => {
  it("groups spend by airline and labels missing airlines 'Other'", () => {
    const s = spendByAirline(bookings);
    expect(s[0]).toEqual({ name: "IndiGo", value: 8000 });
    expect(s.some((x) => x.name === "Other" && x.value === 6000)).toBe(true);
    expect(s.some((x) => x.name === "Air India")).toBe(false); // cancelled
  });
});

describe("topRoutes", () => {
  it("ranks routes by booking count", () => {
    const r = topRoutes(bookings);
    expect(r[0].route).toBe("DEL → BOM");
    expect(r[0].count).toBe(3);
    expect(r[0].revenue).toBe(14000);
  });
  it("respects the limit", () => {
    expect(topRoutes(bookings, 1)).toHaveLength(1);
  });
});

describe("adminStats", () => {
  it("computes platform KPIs", () => {
    const s = adminStats(bookings);
    expect(s.revenue).toBe(17000);
    expect(s.totalBookings).toBe(6);
    expect(s.activeUsers).toBe(4);
    expect(s.cancellationRate).toBe(17); // round(1/6*100)
    expect(s.avgValue).toBe(3400);
  });
  it("handles an empty list", () => {
    expect(adminStats([])).toMatchObject({ revenue: 0, totalBookings: 0, activeUsers: 0, cancellationRate: 0, avgValue: 0 });
  });
  it("handles an all-cancelled list (no revenue rows)", () => {
    const s = adminStats([{ status: "cancelled", amount: 100, userPhone: "x", trip: {}, flight: {} }]);
    expect(s.cancellationRate).toBe(100);
    expect(s.avgValue).toBe(0);
  });
});

describe("bookingsByStatus", () => {
  it("counts by status", () => {
    const s = bookingsByStatus(bookings);
    const map = Object.fromEntries(s.map((x) => [x.status, x.count]));
    expect(map).toEqual({ Confirmed: 4, Pending: 1, Cancelled: 1 });
  });
});

describe("revenueByAirline", () => {
  it("groups revenue + counts by airline, sorted desc", () => {
    const r = revenueByAirline(bookings);
    expect(r[0]).toEqual({ airline: "IndiGo", count: 2, revenue: 8000 });
    expect(r.some((x) => x.airline === "Other" && x.revenue === 6000)).toBe(true);
  });
});

describe("usersActivity", () => {
  it("aggregates per user and defaults a missing name to 'Traveller'", () => {
    const u = usersActivity(bookings);
    expect(u[0]).toEqual({ phone: "+91a", name: "A", bookings: 2, spent: 8000 });
    const d = u.find((x) => x.phone === "+91d");
    expect(d.name).toBe("Traveller");
    const b = u.find((x) => x.phone === "+91b");
    expect(b.bookings).toBe(2);   // both bookings counted
    expect(b.spent).toBe(2000);   // cancelled one excluded from spend
  });
});

// Bookings missing amount / trip / flight, plus two in the same month, to cover
// the nullish (`?.`) and `|| 0` fallback branches.
const edge = [
  { userPhone: "e1", status: "confirmed", trip: { from: "DEL", to: "BOM", depart: "2026-03-01" }, flight: { airlineName: "IndiGo" } }, // no amount
  { userPhone: "e1", status: "confirmed", amount: 100, trip: { from: "DEL", to: "BOM", depart: "2026-03-15" }, flight: { airlineName: "IndiGo" } }, // same month
  { userPhone: "e2", status: "confirmed", amount: 200, flight: { airlineName: "Vistara" } }, // no trip
  { userPhone: "e3", status: "confirmed", amount: 300, trip: { from: "HYD", to: "BLR", depart: "2026-03-20" } }, // no flight
];

describe("edge cases (missing fields)", () => {
  it("treats a missing amount as 0", () => {
    expect(userStats(edge).totalSpent).toBe(600);
    expect(userStats(edge).highest).toBe(300);
  });
  it("aggregates multiple bookings in the same month", () => {
    const mar = monthlySpend(edge).find((x) => x.month === "Mar");
    expect(mar.value).toBe(400); // 0 + 100 + 300 (the no-trip one is skipped)
    expect(tripsPerMonth(edge).find((x) => x.month === "Mar").count).toBe(3);
  });
  it("labels a missing flight as 'Other' and tolerates a missing trip", () => {
    expect(spendByAirline(edge).some((x) => x.name === "Other")).toBe(true);
    expect(revenueByAirline(edge).some((x) => x.airline === "Other")).toBe(true);
    expect(() => topRoutes(edge)).not.toThrow();
    expect(usersActivity(edge).find((x) => x.phone === "e1").spent).toBe(100);
    expect(adminStats(edge).revenue).toBe(600);
  });
});
