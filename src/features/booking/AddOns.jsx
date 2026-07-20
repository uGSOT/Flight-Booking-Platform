import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext.jsx";
import { AIRPORTS } from "../../data/airports.js";
import { MEALS } from "../../data/meals.js";
import { minutesToTime } from "../../lib/mockFlights.js";
import { formatINR, formatDayDate, formatDuration } from "../../lib/format.js";
import { Plane, ArrowLeft } from "../../components/icons.jsx";
import TripSummary from "./TripSummary.jsx";
import BookingFooter from "./BookingFooter.jsx";
import EmptyBooking from "./EmptyBooking.jsx";
import styles from "./AddOns.module.css";

const COLS = ["A", "B", "C", "D", "E", "F"];
const ROWS = [1, 2, 3, 4, 5, 6, 7];

// Seeded occupied seats so the map is stable per flight.
function occupiedSeats(flightId) {
  const set = new Set();
  let h = 0;
  for (let i = 0; i < String(flightId).length; i++) h = (h * 31 + flightId.charCodeAt(i)) >>> 0;
  ROWS.forEach((r) => COLS.forEach((c) => {
    h = (h * 1103515245 + 12345) >>> 0;
    if (h % 100 < 22) set.add(`${r}${c}`);
  }));
  return set;
}

export default function AddOns() {
  const { draft, update } = useBooking();
  const navigate = useNavigate();
  const { flight, trip, fareTier } = draft;

  const seatFree = fareTier?.key === "regular" || fareTier?.key === "flexi";
  const SEAT_PRICE = seatFree ? 0 : 300;

  const occupied = useMemo(() => occupiedSeats(flight?.id || "x"), [flight?.id]);
  const [seat, setSeat] = useState(draft.seats?.[0]?.label || null);
  const [meals, setMeals] = useState(draft.meals || []);
  const [vegOnly, setVegOnly] = useState(false);

  if (!flight || !trip) return <EmptyBooking />;

  const origin = AIRPORTS[trip.from] || { code: trip.from, name: "" };
  const dest = AIRPORTS[trip.to] || { code: trip.to, name: "" };
  const shownMeals = vegOnly ? MEALS.filter((m) => m.veg) : MEALS;

  function pickSeat(label) {
    if (occupied.has(label)) return;
    setSeat((cur) => (cur === label ? null : label));
  }
  function toggleMeal(m) {
    setMeals((prev) => (prev.some((x) => x.id === m.id) ? prev.filter((x) => x.id !== m.id) : [...prev, { id: m.id, label: m.name, amount: m.price }]));
  }

  // live total incorporating current (unsaved) selections
  const seatAddon = seat ? [{ type: "seat", label: seat, amount: SEAT_PRICE }] : [];
  const liveTotal = (fareTier?.price ?? flight.price) + seatAddon.reduce((s, x) => s + x.amount, 0) + meals.reduce((s, x) => s + x.amount, 0) - (draft.discountAmount || 0);

  function next() {
    update({ seats: seatAddon, meals });
    navigate("/booking/payment");
  }

  return (
    <div>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Traveller details
      </button>

      <div className={styles.strip}>
        <div className={styles.airline}>
          <span className={styles.logo} style={{ background: flight.airlineColor }}><Plane size={16} /></span>
          <div><strong>{flight.airlineName}</strong><small>{flight.flightNo}</small></div>
        </div>
        <div className={styles.leg}><span className={styles.time}>{minutesToTime(flight.depMin)}</span><span className={styles.code}>{origin.code} <em>({formatDayDate(trip.depart)})</em></span><small>{origin.name}</small></div>
        <div className={styles.mid}><span>{formatDuration(flight.durationMin)}</span><span className={styles.line}><Plane size={14} /></span><span className={styles.ns}>{flight.stops === 0 ? "Non-Stop" : `${flight.stops} Stop`}</span></div>
        <div className={styles.leg}><span className={styles.time}>{minutesToTime(flight.arrMin)}</span><span className={styles.code}>{dest.code} <em>({formatDayDate(trip.depart)})</em></span><small>{dest.name}</small></div>
      </div>

      <div className={styles.layout}>
        {/* Seat map */}
        <section className={styles.panel}>
          <h2>Select Seat</h2>
          <div className={styles.seatHead}>
            <span>A</span><span>B</span><span>C</span><span className={styles.aisle} /><span>D</span><span>E</span><span>F</span>
          </div>
          {ROWS.map((r) => (
            <div key={r} className={styles.seatRow}>
              {COLS.slice(0, 3).map((c) => <Seat key={c} label={`${r}${c}`} occupied={occupied.has(`${r}${c}`)} selected={seat === `${r}${c}`} onClick={pickSeat} />)}
              <span className={styles.rowNo}>{r}</span>
              {COLS.slice(3).map((c) => <Seat key={c} label={`${r}${c}`} occupied={occupied.has(`${r}${c}`)} selected={seat === `${r}${c}`} onClick={pickSeat} />)}
            </div>
          ))}
          <div className={styles.legend}>
            <span><i className={styles.lgAvail} /> Available</span>
            <span><i className={styles.lgSel} /> Selected</span>
            <span><i className={styles.lgOcc} /> Occupied</span>
            <span className={styles.seatPrice}>{SEAT_PRICE === 0 ? "Free with your fare" : `${formatINR(SEAT_PRICE)} / seat`}</span>
          </div>
        </section>

        {/* Meals */}
        <section className={styles.panel}>
          <div className={styles.mealsHead}>
            <h2>Meals</h2>
            <label className={styles.vegToggle}>
              Veg Only
              <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
              <span className={styles.switch} />
            </label>
          </div>
          <div className={styles.mealList}>
            {shownMeals.map((m) => {
              const added = meals.some((x) => x.id === m.id);
              return (
                <div key={m.id} className={styles.meal}>
                  <span className={styles.mealImg} aria-hidden="true" />
                  <div className={styles.mealInfo}>
                    <strong>{m.name}</strong>
                    <span className={styles.mealMeta}>
                      <i className={m.veg ? styles.vegDot : styles.nonvegDot} />
                      {formatINR(m.price)}
                    </span>
                  </div>
                  <button type="button" className={added ? styles.added : styles.add} onClick={() => toggleMeal(m)}>
                    {added ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <TripSummary draft={{ ...draft, seats: seatAddon, meals }} />
      </div>

      <BookingFooter total={liveTotal} promo={draft.promoCode ? `₹${draft.discountAmount} OFF using ${draft.promoCode} code` : null} ctaLabel="Pay" onNext={next} />
    </div>
  );
}

function Seat({ label, occupied, selected, onClick }) {
  const cls = occupied ? styles.seatOcc : selected ? styles.seatSel : styles.seat;
  return (
    <button type="button" className={cls} onClick={() => onClick(label)} disabled={occupied} aria-label={`Seat ${label}${occupied ? " occupied" : ""}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6 4a2 2 0 0 1 2 2v6h8V6a2 2 0 1 1 4 0v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm-1 14h14v2H5z" />
      </svg>
    </button>
  );
}
