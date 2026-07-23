import Modal from "./Modal.jsx";
import styles from "./ConfirmDialog.module.css";

/** Confirmation dialog for destructive/irreversible actions. */
export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, busy = false, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={busy ? undefined : onClose} size="sm" closeable={!busy}>
      <div className={styles.body}>
        <h2>{title}</h2>
        {message && <p>{message}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose} disabled={busy}>{cancelLabel}</button>
          <button
            type="button"
            className={danger ? styles.danger : styles.confirm}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
