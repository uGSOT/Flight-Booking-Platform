import { NavLink, Outlet } from "react-router-dom";
import { Search, Ticket, Compare } from "../../components/icons.jsx";
import styles from "./Dashboard.module.css";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: Search, end: true },
  { to: "/bookings", label: "My Bookings", icon: Ticket },
  { to: "/dashboard/reports", label: "Reports", icon: Compare },
];

export default function DashboardLayout() {
  return (
    <div className={`container ${styles.shell}`}>
      <aside className={styles.sidebar}>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? styles.navActive : styles.nav)}>
            <n.icon size={18} /> {n.label}
          </NavLink>
        ))}
      </aside>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
