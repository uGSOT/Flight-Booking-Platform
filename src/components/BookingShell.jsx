import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import BookingStepper from "./BookingStepper.jsx";
import { User, Chevron } from "./icons.jsx";
import logo from "../assets/images/logo.png";
import styles from "./BookingShell.module.css";

// Map a pathname to the active booking step (1–4).
function stepFor(pathname) {
  if (pathname.startsWith("/booking/review")) return 2;
  if (pathname.startsWith("/booking/addons")) return 3;
  if (pathname.startsWith("/booking/payment")) return 4;
  return 1; // /flights and default
}

export default function BookingShell() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand} aria-label="AirMe home">
            <img className={styles.logoImg} src={logo} alt="" aria-hidden="true" />
            AirMe
          </Link>

          <BookingStepper current={stepFor(pathname)} />

          {isAuthenticated ? (
            <button type="button" className={styles.account}>
              <span className={styles.avatar}><User size={18} /></span>
              My Account
              <Chevron size={16} />
            </button>
          ) : (
            <Link to="/?login=1" className={styles.loginBtn}>Log In</Link>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
