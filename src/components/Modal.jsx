import { useEffect } from "react";
import styles from "./Modal.module.css";

/** Accessible overlay modal. Closes on Escape and backdrop click. */
export default function Modal({ open, onClose, children, size = "md", closeable = true }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && closeable) onClose?.();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, closeable]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={() => closeable && onClose?.()}>
      <div
        className={`${styles.modal} ${styles[size]}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
