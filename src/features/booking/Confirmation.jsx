import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBooking } from "../../lib/bookingsStore.js";
import { AIRPORTS } from "../../data/airports.js";
import { minutesToTime } from "../../lib/mockFlights.js";
import { formatINR, formatDayDate, formatDuration } from "../../lib/format.js";
import { Check, Plane } from "../../components/icons.jsx";
import EmptyBooking from "./EmptyBooking.jsx";
import styles from "./Confirmation.module.css";

export default function Confirmation() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const booking = useMemo(() => getBooking(ref), [ref]);

  if (!booking) return <EmptyBooking />;

  const { flight, trip, passengers = [], seats = [], meals = [] } = booking;
  const origin = AIRPORTS[trip.from] || { code: trip.from, name: "" };
  const dest = AIRPORTS[trip.to] || { code: trip.to, name: "" };

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <span className={styles.tick}><Check size={34} /></span>
        <h1>Booking Confirmed!</h1>
        <p>Your e-ticket has been booked. A confirmation has been sent to {booking.contact?.phone || "your phone"}.</p>
        <div className={styles.ref}>Booking Reference <strong>{booking.ref}</strong></div>
      </div>

      <div className={styles.card}>
        <div className={styles.flightHead}>
          <span className={styles.logo} style={{ background: flight.airlineColor }}><Plane size={16} /></span>
          <div><strong>{flight.airlineName}</strong> <small>{flight.flightNo}</small></div>
          <span className={styles.status}>Confirmed</span>
        </div>

        <div className={styles.itinerary}>
          <div><span className={styles.time}>{minutesToTime(flight.depMin)}</span><span className={styles.code}>{origin.code}</span><small>{formatDayDate(trip.depart)}</small></div>
          <div className={styles.mid}><span>{formatDuration(flight.durationMin)}</span><span className={styles.line}><Plane size={14} /></span><span className={styles.ns}>{flight.stops === 0 ? "Non-Stop" : `${flight.stops} Stop`}</span></div>
          <div><span className={styles.time}>{minutesToTime(flight.arrMin)}</span><span className={styles.code}>{dest.code}</span><small>{formatDayDate(trip.depart)}</small></div>
        </div>

        <div className={styles.grid}>
          <div>
            <span className={styles.gLabel}>Passengers</span>
            {passengers.map((p, i) => <p key={i}>{p.firstName} {p.lastName} <em>({p.type})</em></p>)}
          </div>
          <div>
            <span className={styles.gLabel}>Add-ons</span>
            <p>Seat: {seats.map((s) => s.label).join(", ") || "—"}</p>
            <p>Meals: {meals.length ? `${meals.length} added` : "—"}</p>
          </div>
          <div>
            <span className={styles.gLabel}>Amount paid</span>
            <p className={styles.amount}>{formatINR(booking.amount)}</p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={() => navigate(`/bookings`)}>View Booking</button>
        <button type="button" className={styles.ghost} onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
        <button type="button" className={styles.ghost} onClick={() => navigate("/")}>Book Another Flight</button>
      </div>
    </div>
  );
}
