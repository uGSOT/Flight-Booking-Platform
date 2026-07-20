import { useMemo } from "react";
import { listBookings } from "../../lib/bookingsStore.js";
import { adminStats, monthlySpend, bookingsByStatus } from "../../lib/analytics.js";
import { formatINR, formatDate } from "../../lib/format.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import styles from "./Admin.module.css";

export default function AdminOverview() {
  const all = useMemo(() => listBookings(), []);
  const stats = useMemo(() => adminStats(all), [all]);
  const revenue = useMemo(() => monthlySpend(all), [all]);
  const byStatus = useMemo(() => bookingsByStatus(all), [all]);
  const recent = all.slice(0, 10);

  const cards = [
    { label: "Total revenue", value: formatINR(stats.revenue) },
    { label: "Total bookings", value: stats.totalBookings },
    { label: "Active users", value: stats.activeUsers },
    { label: "Cancellation rate", value: `${stats.cancellationRate}%` },
  ];

  return (
    <div>
      <h1 className={styles.pageTitle}>Overview</h1>
      <div className={styles.kpiRow}>
        {cards.map((c) => (
          <div key={c.label} className={styles.kpi}>
            <span>{c.label}</span>
            <strong className="tabular">{c.value}</strong>
          </div>
        ))}
      </div>

      <div className={styles.chartRow}>
        <section className={styles.panel}>
          <h2>Revenue over time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenue} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" />
              <XAxis dataKey="month" stroke="#8a92a0" fontSize={12} />
              <YAxis stroke="#8a92a0" fontSize={12} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Line type="monotone" dataKey="value" stroke="#2b4c7e" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className={styles.panel}>
          <h2>Bookings by status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byStatus} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" />
              <XAxis dataKey="status" stroke="#8a92a0" fontSize={12} />
              <YAxis stroke="#8a92a0" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f28c28" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className={styles.panel}>
        <h2>Recent bookings</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Booking ID</th><th>User</th><th>Route</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.ref}>
                  <td className={styles.mono}>{b.ref}</td>
                  <td>{b.userName || b.userPhone}</td>
                  <td>{b.trip.from} → {b.trip.to}</td>
                  <td>{formatDate(b.trip.depart)}</td>
                  <td className="tabular">{formatINR(b.amount)}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
