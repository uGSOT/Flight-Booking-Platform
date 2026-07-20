// Aggregations over bookings for the user Dashboard/Reports and Admin analytics.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const isRevenue = (b) => b.status !== "cancelled";
const monthKey = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : MONTHS[d.getMonth()];
};

/** User-level summary stats. */
export function userStats(bookings) {
  const active = bookings.filter(isRevenue);
  const spent = active.reduce((s, b) => s + (b.amount || 0), 0);
  const today = new Date("2026-07-20");
  const upcoming = active.filter((b) => new Date(b.trip?.depart) >= today).length;
  const destinations = new Set(active.map((b) => b.trip?.to)).size;
  return {
    totalBookings: bookings.length,
    totalSpent: spent,
    upcoming,
    destinations,
    avgPerTrip: active.length ? Math.round(spent / active.length) : 0,
    highest: active.reduce((m, b) => Math.max(m, b.amount || 0), 0),
  };
}

/** [{month, value}] spend by month (in trip.depart order Jan→Dec). */
export function monthlySpend(bookings) {
  const map = new Map();
  bookings.filter(isRevenue).forEach((b) => {
    const m = monthKey(b.trip?.depart);
    if (m) map.set(m, (map.get(m) || 0) + (b.amount || 0));
  });
  return MONTHS.filter((m) => map.has(m)).map((m) => ({ month: m, value: map.get(m) }));
}

/** [{month, count}] trips per month. */
export function tripsPerMonth(bookings) {
  const map = new Map();
  bookings.filter(isRevenue).forEach((b) => {
    const m = monthKey(b.trip?.depart);
    if (m) map.set(m, (map.get(m) || 0) + 1);
  });
  return MONTHS.filter((m) => map.has(m)).map((m) => ({ month: m, count: map.get(m) }));
}

/** [{name, value}] spend grouped by airline. */
export function spendByAirline(bookings) {
  const map = new Map();
  bookings.filter(isRevenue).forEach((b) => {
    const k = b.flight?.airlineName || "Other";
    map.set(k, (map.get(k) || 0) + (b.amount || 0));
  });
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

/** [{route, count, revenue}] top routes by bookings. */
export function topRoutes(bookings, limit = 8) {
  const map = new Map();
  bookings.filter(isRevenue).forEach((b) => {
    const k = `${b.trip?.from} → ${b.trip?.to}`;
    const cur = map.get(k) || { route: k, count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += b.amount || 0;
    map.set(k, cur);
  });
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

/** Admin: platform KPIs. */
export function adminStats(bookings) {
  const revenue = bookings.filter(isRevenue).reduce((s, b) => s + (b.amount || 0), 0);
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const users = new Set(bookings.map((b) => b.userPhone)).size;
  return {
    revenue,
    totalBookings: bookings.length,
    activeUsers: users,
    cancellationRate: bookings.length ? Math.round((cancelled / bookings.length) * 100) : 0,
    avgValue: bookings.length ? Math.round(revenue / bookings.filter(isRevenue).length || 0) : 0,
  };
}

/** Admin: [{status, count}] for the bookings-by-status chart. */
export function bookingsByStatus(bookings) {
  const map = { confirmed: 0, pending: 0, cancelled: 0 };
  bookings.forEach((b) => { map[b.status] = (map[b.status] || 0) + 1; });
  return Object.entries(map).map(([status, count]) => ({ status: status[0].toUpperCase() + status.slice(1), count }));
}

/** Admin: revenue grouped by airline [{airline, count, revenue}]. */
export function revenueByAirline(bookings) {
  const map = new Map();
  bookings.filter(isRevenue).forEach((b) => {
    const k = b.flight?.airlineName || "Other";
    const cur = map.get(k) || { airline: k, count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += b.amount || 0;
    map.set(k, cur);
  });
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

/** Admin: per-user activity [{phone, name, bookings, spent}]. */
export function usersActivity(bookings) {
  const map = new Map();
  bookings.forEach((b) => {
    const cur = map.get(b.userPhone) || { phone: b.userPhone, name: b.userName || "Traveller", bookings: 0, spent: 0 };
    cur.bookings += 1;
    if (b.status !== "cancelled") cur.spent += b.amount || 0;
    map.set(b.userPhone, cur);
  });
  return [...map.values()].sort((a, b) => b.spent - a.spent);
}
