import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "./SiteLayout.module.css";

export default function SiteLayout() {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to="/" className={styles.brand} aria-label="AirMe home">
            <span className={styles.logo} aria-hidden="true">✈</span>
            AirMe
          </Link>

          <nav className={styles.nav}>
            <NavLink to="/bookings" className={styles.navLink}>My Bookings</NavLink>
            <a href="#support" className={styles.navLink}>Support</a>
            {isAuthenticated ? (
              <div className={styles.account}>
                <span className={styles.phone}>{user?.phone}</span>
                <button type="button" className={styles.ghostBtn} onClick={signOut}>
                  Log out
                </button>
              </div>
            ) : (
              <Link to="/?login=1" className={styles.primaryBtn}>Log In</Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className={styles.footer} id="support">
        <div className="container">
          <div className={styles.footerBrand}>
            <span className={styles.logo} aria-hidden="true">✈</span> AirMe
          </div>
          <p className={styles.footerTag}>Your trusted travel partner for flights across the globe.</p>
          <p className={styles.copyright}>2026 © AirMe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
