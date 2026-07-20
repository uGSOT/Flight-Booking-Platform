import { useMemo, useState } from "react";
import { listBookings } from "../../lib/bookingsStore.js";
import { revenueByAirline, bookingsByStatus, usersActivity, topRoutes, monthlySpend } from "../../lib/analytics.js";
import { formatINR } from "../../lib/format.js";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import styles from "./Admin.module.css";

const DONUT = ["#1a9e5f", "#d98a00", "#d64545"];
const TABS = ["Revenue", "Bookings", "Users", "Routes"];

export default function AdminReports() {
  const all = useMemo(() => listBookings(), []);
  const [tab, setTab] = useState("Revenue");

  const revByAirline = useMemo(() => revenueByAirline(all), [all]);
  const byStatus = useMemo(() => bookingsByStatus(all), [all]);
  const users = useMemo(() => usersActivity(all).slice(0, 8), [all]);
  const routes = useMemo(() => topRoutes(all, 8), [all]);
  const revTime = useMemo(() => monthlySpend(all), [all]);

  return (
    <div>
      <h1 className={styles.pageTitle}>Reports</h1>
      <div className={styles.reportTabs}>
        {TABS.map((t) => (
          <button key={t} type="button" className={tab === t ? styles.rtabActive : styles.rtab} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "Revenue" && (
        <div className={styles.chartRow}>
          <section className={styles.panel}>
            <h2>Revenue over time</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revTime} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" /><XAxis dataKey="month" stroke="#8a92a0" fontSize={12} /><YAxis stroke="#8a92a0" fontSize={12} /><Tooltip formatter={(v) => formatINR(v)} />
                <Line type="monotone" dataKey="value" stroke="#2b4c7e" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>
          <section className={styles.panel}>
            <h2>Revenue by airline</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revByAirline} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" /><XAxis dataKey="airline" stroke="#8a92a0" fontSize={10} /><YAxis stroke="#8a92a0" fontSize={12} /><Tooltip formatter={(v) => formatINR(v)} />
                <Bar dataKey="revenue" fill="#2b4c7e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>
      )}

      {tab === "Bookings" && (
        <div className={styles.chartRow}>
          <section className={styles.panel}>
            <h2>Bookings by status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {byStatus.map((_, i) => <Cell key={i} fill={DONUT[i % DONUT.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </section>
          <section className={styles.panel}>
            <h2>Bookings by airline</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Airline</th><th>Bookings</th><th>Revenue</th></tr></thead>
                <tbody>{revByAirline.map((a) => <tr key={a.airline}><td>{a.airline}</td><td>{a.count}</td><td className="tabular">{formatINR(a.revenue)}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {tab === "Users" && (
        <section className={styles.panel}>
          <h2>Top users by spend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={users} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" horizontal={false} /><XAxis type="number" stroke="#8a92a0" fontSize={12} /><YAxis type="category" dataKey="name" stroke="#8a92a0" fontSize={11} width={90} /><Tooltip formatter={(v) => formatINR(v)} />
              <Bar dataKey="spent" fill="#1a9e5f" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {tab === "Routes" && (
        <section className={styles.panel}>
          <h2>Top routes by bookings</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Route</th><th>Bookings</th><th>Revenue</th><th>Avg fare</th></tr></thead>
              <tbody>{routes.map((r) => <tr key={r.route}><td>{r.route}</td><td>{r.count}</td><td className="tabular">{formatINR(r.revenue)}</td><td className="tabular">{formatINR(Math.round(r.revenue / r.count))}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
