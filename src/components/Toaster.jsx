import { useSyncExternalStore } from "react";
import { subscribeToasts, dismissToast } from "../lib/toast.js";
import { Check, Minus } from "./icons.jsx";
import styles from "./Toaster.module.css";

const ICON = { success: Check, error: Minus, warning: Minus, info: Minus };

/** Renders the global toast stack. Mount once near the app root. */
export default function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, () => currentToasts, () => currentToasts);
  return (
    <div className={styles.wrap} role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICON[t.type] || Minus;
        return (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`} role="status">
            <span className={styles.icon}><Icon size={14} /></span>
            <span className={styles.msg}>{t.message}</span>
            <button type="button" className={styles.close} onClick={() => dismissToast(t.id)} aria-label="Dismiss">✕</button>
          </div>
        );
      })}
    </div>
  );
}

// Keep a stable snapshot reference for useSyncExternalStore.
let currentToasts = [];
subscribeToasts((t) => { currentToasts = t; });
