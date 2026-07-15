import { minutesToTime } from "../../lib/mockFlights.js";
import { formatINR, formatDuration } from "../../lib/format.js";
import { Plane, ArrowUpRight } from "../../components/icons.jsx";
import styles from "./FlightCard.module.css";

function stopsLabel(stops) {
  if (stops === 0) return "Non-Stop";
  if (stops === 1) return "1 Stop";
  return `${stops} Stops`;
}

/**
 * Flight result card.
 * @param {object} props
 * @param {object} props.flight
 * @param {object} props.from resolved origin airport
 * @param {object} props.to resolved destination airport
 * @param {boolean} [props.compact] round-trip condensed variant (no CTAs)
 * @param {boolean} [props.selected]
 * @param {() => void} [props.onSelect]
 * @param {() => void} [props.onBook]
 */
export default function FlightCard({ flight, from, to, compact, selected, onSelect, onBook }) {
  const cls = `${styles.card} ${compact ? styles.compact : ""} ${selected ? styles.selected : ""}`;
  return (
    <div className={cls} onClick={compact ? onSelect : undefined} role={compact ? "button" : undefined}>
      <span className={styles.refund}>{flight.refundable}</span>

      <div className={styles.body}>
        <div className={styles.airline}>
          <span className={styles.logo} style={{ background: flight.airlineColor }}>
            <Plane size={16} />
          </span>
          <div>
            <strong>{flight.airlineName}</strong>
            <small>{flight.flightNo}</small>
          </div>
        </div>

        <div className={styles.leg}>
          <span className={styles.time}>{minutesToTime(flight.depMin)}</span>
          <span className={styles.code}>{from?.code}</span>
          <small className={styles.airport}>{from?.name}</small>
        </div>

        <div className={styles.mid}>
          <span className={styles.duration}>{formatDuration(flight.durationMin)}</span>
          <span className={styles.line}><Plane size={14} /></span>
          <span className={styles.stops}>{stopsLabel(flight.stops)}</span>
        </div>

        <div className={styles.leg}>
          <span className={styles.time}>{minutesToTime(flight.arrMin)}</span>
          <span className={styles.code}>{to?.code}</span>
          <small className={styles.airport}>{to?.name}</small>
        </div>

        <div className={styles.priceCol}>
          <span className={`${styles.price} tabular`}>{formatINR(flight.price)}</span>
          {flight.promo && <span className={styles.promo}>{flight.promo}</span>}
        </div>

        {!compact && (
          <div className={styles.actions}>
            <button type="button" className={styles.book} onClick={onBook}>
              Book <ArrowUpRight size={15} />
            </button>
            <button type="button" className={styles.details}>View Details</button>
          </div>
        )}
      </div>
    </div>
  );
}
