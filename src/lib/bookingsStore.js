// LocalStorage-backed bookings store. Stands in for Supabase until the backend
// is wired (PRD D8 / Architecture §5). Powers My Bookings, Dashboard and Admin.
const KEY = "airme.bookings";
const SEQ_KEY = "airme.bookingSeq";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

/** Generate a booking reference like BK-2026-0042. */
export function nextRef() {
  const seq = Number(localStorage.getItem(SEQ_KEY) || "41") + 1;
  localStorage.setItem(SEQ_KEY, String(seq));
  return `BK-2026-${String(seq).padStart(4, "0")}`;
}

export function saveBooking(booking) {
  const list = read();
  list.unshift(booking);
  write(list);
  return booking;
}

export function listBookings({ phone } = {}) {
  const list = read();
  return phone ? list.filter((b) => b.userPhone === phone) : list;
}

export function getBooking(ref) {
  return read().find((b) => b.ref === ref) || null;
}

export function updateBookingStatus(ref, status) {
  const list = read();
  const b = list.find((x) => x.ref === ref);
  if (b) {
    b.status = status;
    write(list);
  }
  return b;
}
