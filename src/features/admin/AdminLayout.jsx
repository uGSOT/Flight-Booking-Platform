import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Search, Ticket, User, Compare, ArrowUpRight } from "../../components/icons.jsx";
import logo from "../../assets/images/logo.png";
import styles from "./Admin.module.css";

const NAV = [
  { to: "/admin", label: "Overview", icon: Search, end: true },
  { to: "/admin/bookings", label: "All Bookings", icon: Ticket },
  { to: "/admin/users", label: "Users", icon: User },
  { to: "/admin/reports", label: "Reports", icon: Compare },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src={logo} alt="" className={styles.logo} />
          AirMe <span className={styles.adminTag}>Admin</span>
        </div>
        <nav className={styles.nav}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className={styles.exit} onClick={() => navigate("/")}>
          Exit to site <ArrowUpRight size={15} />
        </button>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
