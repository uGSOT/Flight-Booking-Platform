import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBookings } from "../../lib/db.js";
import { usersActivity } from "../../lib/analytics.js";
import { formatINR } from "../../lib/format.js";
import styles from "./Admin.module.css";

export default function AdminUsers() {
  const { data: bookings = [] } = useQuery({ queryKey: ["bookings"], queryFn: () => listBookings() });
  const users = useMemo(() => usersActivity(bookings), [bookings]);
  const [q, setQ] = useState("");
  const rows = users.filter((u) => !q || `${u.name} ${u.phone}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 className={styles.pageTitle}>Users</h1>
      <div className={styles.toolbar}>
        <span className={styles.count}>{users.length} users</span>
        <input className={styles.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone" />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Phone</th><th>Total bookings</th><th>Total spent</th><th>Role</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.phone}>
                <td>{u.name}</td>
                <td>{u.phone}</td>
                <td>{u.bookings}</td>
                <td className="tabular">{formatINR(u.spent)}</td>
                <td><span className={styles.roleBadge}>User</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
