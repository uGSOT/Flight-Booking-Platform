import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { listBookings } from "../../lib/bookingsStore.js";
import { userStats } from "../../lib/analytics.js";
import { formatINR, formatDate } from "../../lib/format.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import styles from "./Dashboard.module.css";

export default function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const bookings = useMemo(() => listBookings({ phone: user?.phone }), [user?.phone]);
  const stats = useMemo(() => userStats(bookings), [bookings]);

  const today = new Date("2026-07-20");
  const upcoming = bookings.filter((b) => b.status !== "cancelled" && new Date(b.trip?.depart) >= today)
    .sort((a, b) => new Date(a.trip?.depart) - new Date(b.trip?.depart))[0];
  const recent = bookings.slice(0, 3);

  const cards = [
    { label: "Total bookings", value: stats.totalBookings },
    { label: "Total spent", value: formatINR(stats.totalSpent) },
    { label: "Upcoming trips", value: stats.upcoming },
    { label: "Destinations", value: stats.destinations },
  ];

  return (
    <div>
      <div className={styles.pageHead}>
        <h1>Hello, {user?.phone ? "Traveller" : "there"} 👋</h1>
        <button type="button" className={styles.primaryBtn} onClick={() => navigate("/")}>Search Flights</button>
      </div>

      <div className={styles.statGrid}>
        {cards.map((c) => (
          <div key={c.label} className={styles.stat}>
            <span className={styles.statLabel}>{c.label}</span>
            <strong className="tabular">{c.value}</strong>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        <section className={styles.panel}>
          <h2>Upcoming trip</h2>
          {upcoming ? (
            <div className={styles.upcoming}>
              <div className={styles.upRoute}>
                <strong>{upcoming.trip.from} → {upcoming.trip.to}</strong>
                <span>{upcoming.flight.airlineName} · {upcoming.flight.flightNo}</span>
              </div>
              <div className={styles.upMeta}>
                <span>{formatDate(upcoming.trip.depart)}</span>
                <StatusBadge status={upcoming.status} />
              </div>
            </div>
          ) : (
            <p className={styles.muted}>No upcoming trips. Time to plan your next getaway!</p>
          )}
        </section>

        <section className={styles.panel}>
          <h2>Recent bookings</h2>
          {recent.length ? (
            <ul className={styles.recentList}>
              {recent.map((b) => (
                <li key={b.ref}>
                  <span className={styles.mono}>{b.ref}</span>
                  <span>{b.trip.from} → {b.trip.to}</span>
                  <span className="tabular">{formatINR(b.amount)}</span>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>No bookings yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
