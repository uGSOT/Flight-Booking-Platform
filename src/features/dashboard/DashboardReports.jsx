import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { listBookings } from "../../lib/bookingsStore.js";
import { userStats, monthlySpend, spendByAirline, tripsPerMonth, topRoutes } from "../../lib/analytics.js";
import { formatINR } from "../../lib/format.js";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import styles from "./Dashboard.module.css";

const DONUT = ["#2b4c7e", "#f28c28", "#1a9e5f", "#6b8cbf", "#d98a00", "#9b7fc0"];

export default function DashboardReports() {
  const { user } = useAuth();
  const bookings = useMemo(() => listBookings({ phone: user?.phone }), [user?.phone]);
  const stats = useMemo(() => userStats(bookings), [bookings]);
  const spend = useMemo(() => monthlySpend(bookings), [bookings]);
  const byAirline = useMemo(() => spendByAirline(bookings), [bookings]);
  const trips = useMemo(() => tripsPerMonth(bookings), [bookings]);
  const routes = useMemo(() => topRoutes(bookings, 6), [bookings]);

  if (!bookings.length) {
    return <div className={styles.emptyReport}><strong>No travel data yet</strong><p>Book a flight to see your spending and travel reports.</p></div>;
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Reports</h1>

      <div className={styles.statRow}>
        <Stat label="Total spent" value={formatINR(stats.totalSpent)} />
        <Stat label="Avg per trip" value={formatINR(stats.avgPerTrip)} />
        <Stat label="Highest booking" value={formatINR(stats.highest)} />
      </div>

      <div className={styles.chartGrid}>
        <section className={styles.panel}>
          <h2>Monthly spending</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={spend} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" />
              <XAxis dataKey="month" stroke="#8a92a0" fontSize={12} />
              <YAxis stroke="#8a92a0" fontSize={12} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Line type="monotone" dataKey="value" stroke="#2b4c7e" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className={styles.panel}>
          <h2>Spend by airline</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byAirline} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byAirline.map((_, i) => <Cell key={i} fill={DONUT[i % DONUT.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatINR(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {byAirline.map((a, i) => <span key={a.name}><i style={{ background: DONUT[i % DONUT.length] }} />{a.name}</span>)}
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Trips per month</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trips} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" />
              <XAxis dataKey="month" stroke="#8a92a0" fontSize={12} />
              <YAxis stroke="#8a92a0" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2b4c7e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className={styles.panel}>
          <h2>Top routes</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={routes} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" horizontal={false} />
              <XAxis type="number" stroke="#8a92a0" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="route" stroke="#8a92a0" fontSize={11} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#f28c28" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <strong className="tabular">{value}</strong>
    </div>
  );
}
