import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { listBookings, updateBookingStatus } from "../../lib/bookingsStore.js";
import { AIRPORTS } from "../../data/airports.js";
import { minutesToTime } from "../../lib/mockFlights.js";
import { formatINR, formatDate, formatDayDate, formatDuration } from "../../lib/format.js";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { Plane, Ticket } from "../../components/icons.jsx";
import styles from "./MyBookings.module.css";

const STATUSES = ["all", "confirmed", "pending", "cancelled"];

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0); // bump to re-read after cancel
  // `version` forces a re-read of the store after a cancel.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(() => listBookings({ phone: user?.phone }), [user?.phone, version]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [openRef, setOpenRef] = useState(null);

  const rows = all.filter((b) => {
    if (status !== "all" && b.status !== status) return false;
    if (q) {
      const hay = `${b.ref} ${b.trip?.from} ${b.trip?.to} ${b.flight?.airlineName}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const active = openRef ? all.find((b) => b.ref === openRef) : null;

  function cancel(ref) {
    updateBookingStatus(ref, "cancelled");
    setVersion((v) => v + 1);
    setOpenRef(null);
  }

  return (
    <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
      <h1 className={styles.title}>My Bookings</h1>

      {all.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><Ticket size={28} /></span>
          <strong>No bookings yet</strong>
          <p>When you book a flight, it’ll show up here.</p>
          <button type="button" onClick={() => navigate("/")}>Search flights</button>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.tabs}>
              {STATUSES.map((s) => (
                <button key={s} type="button" className={status === s ? styles.tabActive : styles.tab} onClick={() => setStatus(s)}>
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <input className={styles.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, route or airline" />
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Booking ID</th><th>Route</th><th>Date</th><th>Airline</th><th>Status</th><th>Amount</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.ref}>
                    <td className={styles.mono}>{b.ref}</td>
                    <td>{b.trip?.from} → {b.trip?.to}</td>
                    <td>{formatDate(b.trip?.depart)}</td>
                    <td>{b.flight?.airlineName}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="tabular">{formatINR(b.amount)}</td>
                    <td><button type="button" className={styles.view} onClick={() => setOpenRef(b.ref)}>View details</button></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={7} className={styles.noMatch}>No bookings match your filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={Boolean(active)} onClose={() => setOpenRef(null)} size="md">
        {active && <BookingDetail booking={active} onCancel={cancel} onClose={() => setOpenRef(null)} />}
      </Modal>
    </div>
  );
}

function BookingDetail({ booking, onCancel, onClose }) {
  const { flight, trip, passengers = [], seats = [], meals = [] } = booking;
  const origin = AIRPORTS[trip.from] || { code: trip.from };
  const dest = AIRPORTS[trip.to] || { code: trip.to };
  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div>
          <span className={styles.mono}>{booking.ref}</span>
          <StatusBadge status={booking.status} />
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className={styles.itin}>
        <span className={styles.logo} style={{ background: flight.airlineColor }}><Plane size={16} /></span>
        <div className={styles.al}><strong>{flight.airlineName}</strong> <small>{flight.flightNo}</small></div>
      </div>
      <div className={styles.legs}>
        <div><strong>{minutesToTime(flight.depMin)}</strong> {origin.code}<small>{formatDayDate(trip.depart)}</small></div>
        <div className={styles.dur}>{formatDuration(flight.durationMin)}<span>{flight.stops === 0 ? "Non-Stop" : `${flight.stops} Stop`}</span></div>
        <div><strong>{minutesToTime(flight.arrMin)}</strong> {dest.code}<small>{formatDayDate(trip.depart)}</small></div>
      </div>

      <Row label="Passengers" value={passengers.map((p) => `${p.firstName} ${p.lastName}`).join(", ") || "—"} />
      <Row label="Seat" value={seats.map((s) => s.label).join(", ") || "—"} />
      <Row label="Meals" value={meals.length ? `${meals.length} added` : "—"} />
      <Row label="Contact" value={booking.contact?.phone || "—"} />
      <Row label="Amount paid" value={formatINR(booking.amount)} strong />

      <div className={styles.timeline}>
        <span className={styles.done}>Booked</span>
        <span className={booking.status === "cancelled" ? styles.cancelled : styles.done}>
          {booking.status === "cancelled" ? "Cancelled" : "Confirmed"}
        </span>
      </div>

      {booking.status === "confirmed" && (
        <button type="button" className={styles.cancelBtn} onClick={() => onCancel(booking.ref)}>Cancel booking</button>
      )}
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <span className={strong ? styles.strong : ""}>{value}</span>
    </div>
  );
}
