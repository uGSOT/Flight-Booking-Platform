import { formatINR } from "../../lib/format.js";
import styles from "./BookingFooter.module.css";

/** Sticky action bar for booking steps: running total + primary CTA. */
export default function BookingFooter({ total, promo, ctaLabel = "Next", onNext, disabled }) {
  return (
    <div className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.priceCol}>
          <strong className={`${styles.total} tabular`}>{formatINR(total)}</strong>
          {promo && <span className={styles.promo}>{promo}</span>}
        </div>
        <button type="button" className={styles.cta} onClick={onNext} disabled={disabled}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
