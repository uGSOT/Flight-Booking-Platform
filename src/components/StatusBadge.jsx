import styles from "./StatusBadge.module.css";

/** Booking status pill: confirmed / pending / cancelled. */
export default function StatusBadge({ status }) {
  const cls = styles[status] || styles.pending;
  const label = status ? status[0].toUpperCase() + status.slice(1) : "—";
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}
