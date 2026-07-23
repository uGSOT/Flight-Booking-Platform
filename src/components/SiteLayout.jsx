import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAuthModal } from "../context/AuthModalContext.jsx";
import AccountMenu from "./AccountMenu.jsx";
import { Ticket, Instagram, LinkedIn, XSocial } from "./icons.jsx";
import logo from "../assets/images/logo.png";
import styles from "./SiteLayout.module.css";

const FOOTER_COLS = [
  { title: "Company", links: ["About Us", "Careers", "Press", "Blog", "Contact Us"] },
  { title: "Supports", links: ["Help Center", "FAQs", "Cancellation", "Refunds", "Terms & Conditions"] },
  { title: "More", links: ["Privacy Policy", "Cookies Policy", "Secure Travel", "Sitemap"] },
];

export default function SiteLayout() {
  const { isAuthenticated } = useAuth();
  const { openLogin } = useAuthModal();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to="/" className={styles.brand} aria-label="AirMe home">
            <img className={styles.logoImg} src={logo} alt="" aria-hidden="true" />
            AirMe
          </Link>

          <nav className={styles.nav}>
            <NavLink to="/bookings" className={styles.navLink}>
              <Ticket size={18} /> My Bookings
            </NavLink>
            {isAuthenticated ? (
              <AccountMenu />
            ) : (
              <button type="button" className={styles.primaryBtn} onClick={() => openLogin()}>Log In</button>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className={styles.footer} id="support">
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerBrand}>
              <img className={styles.logoImgLight} src={logo} alt="" aria-hidden="true" /> AirMe
            </div>
            <p className={styles.footerTag}>Your trusted travel partner for flight across the globe.</p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title} className={styles.footerCol}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l}><a href="#!">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}

          <div className={styles.footerCol}>
            <h4>Follow US</h4>
            <div className={styles.social}>
              <a href="#!" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#!" aria-label="LinkedIn"><LinkedIn size={18} /></a>
              <a href="#!" aria-label="X"><XSocial size={18} /></a>
            </div>
          </div>
        </div>
        <div className={`container ${styles.copyright}`}>2026 © AirMe. All rights reserved.</div>
      </footer>
    </div>
  );
}
