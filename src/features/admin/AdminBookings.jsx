import { useMemo, useState } from "react";
import { listBookings, updateBookingStatus } from "../../lib/bookingsStore.js";
import { formatINR, formatDate } from "../../lib/format.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import styles from "./Admin.module.css";

const STATUSES = ["all", "confirmed", "pending", "cancelled"];

export default function AdminBookings() {
  const [version, setVersion] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(() => listBookings(), [version]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const rows = all.filter((b) => {
    if (status !== "all" && b.status !== status) return false;
    if (q) {
      const hay = `${b.ref} ${b.userName} ${b.userPhone} ${b.trip?.from} ${b.trip?.to} ${b.flight?.airlineName}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  function change(ref, next) {
    updateBookingStatus(ref, next);
    setVersion((v) => v + 1);
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>All Bookings</h1>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {STATUSES.map((s) => (
            <button key={s} type="button" className={status === s ? styles.tabActive : styles.tab} onClick={() => setStatus(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input className={styles.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, user, route, airline" />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Booking ID</th><th>User</th><th>Route</th><th>Date</th><th>Airline</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.ref}>
                <td className={styles.mono}>{b.ref}</td>
                <td>{b.userName || b.userPhone}</td>
                <td>{b.trip.from} → {b.trip.to}</td>
                <td>{formatDate(b.trip.depart)}</td>
                <td>{b.flight.airlineName}</td>
                <td className="tabular">{formatINR(b.amount)}</td>
                <td><StatusBadge status={b.status} /></td>
                <td>
                  <select className={styles.statusSelect} value={b.status} onChange={(e) => change(b.ref, e.target.value)}>
                    <option value="confirmed">Confirm</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancel</option>
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className={styles.noMatch}>No bookings match your filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
