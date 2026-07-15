import { AIRPORTS } from "../../data/airports.js";
import { minutesToTime } from "../../lib/mockFlights.js";
import { formatDayDate, formatDuration } from "../../lib/format.js";
import { Plane } from "../../components/icons.jsx";
import styles from "./TripSummary.module.css";

function Leg({ flight, from, to, depart }) {
  const origin = AIRPORTS[from] || { code: from, name: "" };
  const dest = AIRPORTS[to] || { code: to, name: "" };
  return (
    <div className={styles.card}>
      <div className={styles.airline}>
        <span className={styles.logo} style={{ background: flight.airlineColor }}>
          <Plane size={16} />
        </span>
        <div>
          <strong>{flight.airlineName}</strong>
          <small>{flight.flightNo}</small>
        </div>
      </div>

      <div className={styles.timeline}>
        <div className={styles.point}>
          <span className={styles.time}>{minutesToTime(flight.depMin)}</span>
          <span className={styles.place}>{origin.code} <em>({formatDayDate(depart)})</em></span>
          <small>{origin.name}</small>
        </div>
        <div className={styles.travel}>
          <Plane size={16} />
          <span>Travel time {formatDuration(flight.durationMin)}</span>
        </div>
        <div className={styles.point}>
          <span className={styles.time}>{minutesToTime(flight.arrMin)}</span>
          <span className={styles.place}>{dest.code} <em>({formatDayDate(depart)})</em></span>
          <small>{dest.name}</small>
        </div>
      </div>
    </div>
  );
}

/** Trip Summary side panel — itinerary + baggage. Shared across booking steps 2–4. */
export default function TripSummary({ draft, total }) {
  const { flight, returnFlight, trip } = draft;
  if (!flight || !trip) return null;
  const travellers = (trip.adults || 0) + (trip.children || 0) + (trip.infants || 0);

  return (
    <aside className={styles.panel}>
      <div className={styles.head}>
        <h3>Trip Summary</h3>
        <span className={styles.badge}>{travellers} Traveller{travellers > 1 ? "s" : ""}, {trip.cabin}</span>
      </div>

      <Leg flight={flight} from={trip.from} to={trip.to} depart={trip.depart} />
      {returnFlight && <Leg flight={returnFlight} from={trip.to} to={trip.from} depart={trip.ret} />}

      <div className={styles.baggage}>
        <span className={styles.bagTitle}>Baggage</span>
        <p><span className={styles.tick}>✓</span> 7 Kgs Cabin Baggage</p>
        <p><span className={styles.tick}>✓</span> 15 Kgs Check-in Baggage</p>
      </div>

      {total != null && (
        <div className={styles.total}>
          <span>Total</span>
          <strong className="tabular">₹{total.toLocaleString("en-IN")}</strong>
        </div>
      )}
    </aside>
  );
}
