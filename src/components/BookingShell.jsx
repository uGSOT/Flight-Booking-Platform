import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAuthModal } from "../context/AuthModalContext.jsx";
import BookingStepper from "./BookingStepper.jsx";
import AccountMenu from "./AccountMenu.jsx";
import logo from "../assets/images/logo.png";
import styles from "./BookingShell.module.css";

// Map a pathname to the active booking step (1–4).
function stepFor(pathname) {
  if (pathname.startsWith("/booking/review")) return 2;
  if (pathname.startsWith("/booking/addons")) return 3;
  if (pathname.startsWith("/booking/payment")) return 4;
  if (pathname.startsWith("/booking/confirmation")) return 5; // all steps complete
  return 1; // /flights and default
}

export default function BookingShell() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const { openLogin } = useAuthModal();

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
            <AccountMenu />
          ) : (
            <button type="button" className={styles.loginBtn} onClick={() => openLogin()}>Log In</button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
