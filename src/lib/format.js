// Currency / date / duration formatting helpers (INR, per PRD D6).

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format a number as Indian Rupees, e.g. 7070 -> "₹7,070". */
export function formatINR(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return inr.format(Number(amount));
}

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Format an ISO date/string as "02 Jul 2026". */
export function formatDate(value) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

const dayDateFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

/** Format a date as "Thu, 02 Jul". */
export function formatDayDate(value) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dayDateFmt.format(d);
}

/** Format minutes as "2h 20m". */
export function formatDuration(minutes) {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
