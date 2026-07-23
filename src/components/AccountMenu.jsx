import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "../lib/toast.js";
import { User, Chevron, Ticket, Headset } from "./icons.jsx";
import styles from "./AccountMenu.module.css";

const ITEMS = [
  { label: "My Profile", to: "/profile", icon: User },
  { label: "My Bookings", to: "/bookings", icon: Ticket },
  { label: "Support", to: "/#support", icon: Headset },
];

/** Avatar + dropdown (My Profile, My Bookings, Support, Logout). */
export default function AccountMenu() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className={styles.wrap} ref={ref}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((o) => !o)}>
        <span className={styles.avatar}><User size={18} /></span>
        My Account
        <Chevron size={16} />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {ITEMS.map((it) => (
            <button key={it.label} type="button" className={styles.item} onClick={() => { setOpen(false); navigate(it.to); }}>
              <it.icon size={16} /> {it.label}
            </button>
          ))}
          <div className={styles.divider} />
          <button type="button" className={`${styles.item} ${styles.logout}`} onClick={async () => { setOpen(false); await signOut(); toast.success("You've been logged out."); navigate("/"); }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
