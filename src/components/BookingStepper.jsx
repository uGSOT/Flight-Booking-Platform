import styles from "./BookingStepper.module.css";

const STEPS = [
  { n: 1, label: "Flight Selection" },
  { n: 2, label: "Review & Traveller Details" },
  { n: 3, label: "Add-ons" },
  { n: 4, label: "Payment" },
];

/** 4-step progress indicator for the booking flow. `current` is 1–4. */
export default function BookingStepper({ current = 1 }) {
  return (
    <ol className={styles.stepper}>
      {STEPS.map((s, i) => {
        const state = s.n < current ? "done" : s.n === current ? "active" : "todo";
        return (
          <li key={s.n} className={styles.item}>
            <span className={`${styles.circle} ${styles[state]}`}>{s.n}</span>
            <span className={`${styles.label} ${s.n === current ? styles.labelActive : ""}`}>{s.label}</span>
            {i < STEPS.length - 1 && <span className={styles.connector} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
