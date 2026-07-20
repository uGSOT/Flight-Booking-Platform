import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resolveAirport } from "../../data/airports.js";
import { generateFlights, timeBucket } from "../../lib/mockFlights.js";
import { formatINR } from "../../lib/format.js";
import { useBooking } from "../../context/BookingContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAuthModal } from "../../context/AuthModalContext.jsx";
import { Swap, Calendar, User, Edit } from "../../components/icons.jsx";
import FlightCard from "./FlightCard.jsx";
import FareModal from "./FareModal.jsx";
import styles from "./SearchResults.module.css";

const TIME_BUCKETS = [
  { key: "early", label: "Early morning", range: "12 AM - 8 AM" },
  { key: "morning", label: "Morning", range: "8 AM - 12 PM" },
  { key: "afternoon", label: "Afternoon", range: "12 PM - 4 PM" },
  { key: "evening", label: "Evening", range: "4 PM - 8 PM" },
  { key: "night", label: "Night", range: "8 PM - 12 AM" },
];

const STOP_OPTIONS = [
  { key: 0, label: "Non - Stop" },
  { key: 1, label: "1 Stop" },
  { key: 2, label: "2+ Stop" },
];

const SORTS = [
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "duration", label: "Duration: Shortest" },
  { key: "dep-early", label: "Departure: Earliest" },
  { key: "dep-late", label: "Departure: Latest" },
];

const PRICE_MIN = 2500;
const PRICE_MAX = 18000;
const DUR_MIN = 60;
const DUR_MAX = 1740;

function minOf(flights, pred) {
  const vals = flights.filter(pred).map((f) => f.price);
  return vals.length ? Math.min(...vals) : null;
}

export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { update } = useBooking();
  const { isAuthenticated } = useAuth();
  const { openLogin } = useAuthModal();
  const [fareFor, setFareFor] = useState(null); // flight pending fare selection

  const from = resolveAirport(params.get("from"));
  const to = resolveAirport(params.get("to"));
  const depart = params.get("depart") || "";
  const ret = params.get("ret") || "";
  const tripType = params.get("tripType") === "round" ? "round" : "one_way";
  const travelers = Number(params.get("adults") || 1) + Number(params.get("children") || 0) + Number(params.get("infants") || 0);
  const cabin = params.get("cabin") || "Economy";

  const seedKey = `${from?.code}-${to?.code}-${depart}`;
  const outbound = useMemo(() => generateFlights({ from: from?.code, to: to?.code, depart }), [seedKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const inbound = useMemo(
    () => generateFlights({ from: to?.code, to: from?.code, depart: ret || `${depart}-r` }),
    [seedKey, ret] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [durationMax, setDurationMax] = useState(DUR_MAX);
  const [stops, setStops] = useState(new Set());
  const [airlines, setAirlines] = useState(new Set());
  const [depBuckets, setDepBuckets] = useState(new Set());
  const [arrBuckets, setArrBuckets] = useState(new Set());
  const [sort, setSort] = useState("price-asc");

  const airlineOptions = useMemo(() => {
    const map = new Map();
    outbound.forEach((f) => {
      const cur = map.get(f.airlineCode);
      if (!cur || f.price < cur.price) map.set(f.airlineCode, { code: f.airlineCode, name: f.airlineName, color: f.airlineColor, price: f.price });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [outbound]);

  const stopPrices = useMemo(
    () => ({ 0: minOf(outbound, (f) => f.stops === 0), 1: minOf(outbound, (f) => f.stops === 1), 2: minOf(outbound, (f) => f.stops >= 2) }),
    [outbound]
  );

  function applyFilters(list) {
    return list.filter((f) => {
      if (f.price > priceMax) return false;
      if (f.durationMin > durationMax) return false;
      if (stops.size) {
        const s = f.stops >= 2 ? 2 : f.stops;
        if (!stops.has(s)) return false;
      }
      if (airlines.size && !airlines.has(f.airlineCode)) return false;
      if (depBuckets.size && !depBuckets.has(timeBucket(f.depMin))) return false;
      if (arrBuckets.size && !arrBuckets.has(timeBucket(f.arrMin))) return false;
      return true;
    });
  }

  function sortList(list) {
    const arr = [...list];
    switch (sort) {
      case "price-desc": return arr.sort((a, b) => b.price - a.price);
      case "duration": return arr.sort((a, b) => a.durationMin - b.durationMin);
      case "dep-early": return arr.sort((a, b) => a.depMin - b.depMin);
      case "dep-late": return arr.sort((a, b) => b.depMin - a.depMin);
      default: return arr.sort((a, b) => a.price - b.price);
    }
  }

  const outboundResults = useMemo(() => sortList(applyFilters(outbound)), [outbound, priceMax, durationMax, stops, airlines, depBuckets, arrBuckets, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const inboundResults = useMemo(() => sortList(applyFilters(inbound)), [inbound, priceMax, durationMax, stops, airlines, depBuckets, arrBuckets, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedOut, setSelectedOut] = useState(null);
  const [selectedIn, setSelectedIn] = useState(null);

  function toggle(setFn) {
    return (value) =>
      setFn((prev) => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
      });
  }
  const toggleStop = toggle(setStops);
  const toggleAirline = toggle(setAirlines);
  const toggleDep = toggle(setDepBuckets);
  const toggleArr = toggle(setArrBuckets);

  function resetAll() {
    setPriceMax(PRICE_MAX);
    setDurationMax(DUR_MAX);
    setStops(new Set());
    setAirlines(new Set());
    setDepBuckets(new Set());
    setArrBuckets(new Set());
  }

  function proceed(flight, fareTier, returnFlight = null) {
    const go = () => {
      update({
        flight,
        returnFlight,
        fareTier,
        trip: {
          from: from?.code,
          to: to?.code,
          depart,
          ret,
          tripType,
          adults: Number(params.get("adults") || 1),
          children: Number(params.get("children") || 0),
          infants: Number(params.get("infants") || 0),
          cabin,
        },
      });
      navigate("/booking/review");
    };
    setFareFor(null);
    if (isAuthenticated) go();
    else openLogin(go);
  }

  return (
    <div>
      {/* SEARCH SUMMARY BAR */}
      <div className={styles.summary}>
        <div className={styles.fromTo}>
          <div>
            <span className={styles.sLabel}>From</span>
            <strong>{from?.city} ({from?.code})</strong>
            <small>{from?.name}</small>
          </div>
          <span className={styles.swap}><Swap size={16} /></span>
          <div>
            <span className={styles.sLabel}>To</span>
            <strong>{to?.city} ({to?.code})</strong>
            <small>{to?.name}</small>
          </div>
        </div>
        <div className={styles.sField}>
          <span className={styles.sLabel}>Depart</span>
          <strong><Calendar size={15} /> {depart || "Select date"}</strong>
        </div>
        <div className={styles.sField}>
          <span className={styles.sLabel}>Return {tripType === "one_way" && "(optional)"}</span>
          <strong><Calendar size={15} /> {tripType === "round" ? (ret || "Select date") : "Select date"}</strong>
        </div>
        <div className={styles.sField}>
          <span className={styles.sLabel}>Travelers &amp; Class</span>
          <strong><User size={15} /> {travelers} Traveller{travelers > 1 ? "s" : ""}, {cabin}</strong>
        </div>
        <button type="button" className={styles.edit} onClick={() => navigate("/")}>
          Edit search <Edit size={15} />
        </button>
      </div>

      <div className={styles.layout}>
        {/* FILTERS */}
        <aside className={styles.filters}>
          <div className={styles.filtersHead}>
            <h2>Filters</h2>
            <button type="button" onClick={resetAll}>Reset all</button>
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>Price Range</span>
            <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={100} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} />
            <div className={styles.range}><span>{formatINR(PRICE_MIN)}</span><span>{formatINR(priceMax)}</span></div>
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>Duration</span>
            <input type="range" min={DUR_MIN} max={DUR_MAX} step={10} value={durationMax} onChange={(e) => setDurationMax(Number(e.target.value))} />
            <div className={styles.range}><span>1h</span><span>{Math.round(durationMax / 60)}h</span></div>
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>Stops</span>
            {STOP_OPTIONS.map((s) => (
              <label key={s.key} className={styles.check}>
                <input type="checkbox" checked={stops.has(s.key)} onChange={() => toggleStop(s.key)} />
                <span>{s.label}</span>
                <em>{stopPrices[s.key] != null ? formatINR(stopPrices[s.key]) : "—"}</em>
              </label>
            ))}
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>Airlines</span>
            {airlineOptions.map((a) => (
              <label key={a.code} className={styles.check}>
                <input type="checkbox" checked={airlines.has(a.code)} onChange={() => toggleAirline(a.code)} />
                <span className={styles.airlineName}>
                  <span className={styles.dot} style={{ background: a.color }} />
                  {a.name}
                </span>
                <em>{formatINR(a.price)}</em>
              </label>
            ))}
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>Departure Time</span>
            {TIME_BUCKETS.map((b) => (
              <label key={b.key} className={styles.check}>
                <input type="checkbox" checked={depBuckets.has(b.key)} onChange={() => toggleDep(b.key)} />
                <span>{b.label}</span>
                <em>{b.range}</em>
              </label>
            ))}
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>Arrival Time</span>
            {TIME_BUCKETS.map((b) => (
              <label key={b.key} className={styles.check}>
                <input type="checkbox" checked={arrBuckets.has(b.key)} onChange={() => toggleArr(b.key)} />
                <span>{b.label}</span>
                <em>{b.range}</em>
              </label>
            ))}
          </div>
        </aside>

        {/* RESULTS */}
        <section className={styles.results}>
          <div className={styles.resultsHead}>
            <span>{outboundResults.length} flight{outboundResults.length !== 1 ? "s" : ""} found</span>
            <label className={styles.sort}>
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {tripType === "round" ? (
            <div className={styles.twoCol}>
              <div>
                <h3 className={styles.legHead}>Onward · {from?.code} → {to?.code}</h3>
                {outboundResults.length === 0 ? <EmptyState onReset={resetAll} /> : outboundResults.map((f) => (
                  <FlightCard key={f.id} flight={f} from={from} to={to} compact selected={selectedOut === f.id} onSelect={() => setSelectedOut(f.id)} />
                ))}
              </div>
              <div>
                <h3 className={styles.legHead}>Return · {to?.code} → {from?.code}</h3>
                {inboundResults.length === 0 ? <EmptyState onReset={resetAll} /> : inboundResults.map((f) => (
                  <FlightCard key={f.id} flight={f} from={to} to={from} compact selected={selectedIn === f.id} onSelect={() => setSelectedIn(f.id)} />
                ))}
              </div>
            </div>
          ) : (
            outboundResults.length === 0 ? (
              <EmptyState onReset={resetAll} />
            ) : (
              outboundResults.map((f) => (
                <FlightCard key={f.id} flight={f} from={from} to={to} onBook={() => setFareFor(f)} />
              ))
            )
          )}

          {tripType === "round" && (selectedOut && selectedIn) && (
            <div className={styles.roundBar}>
              <span>Onward + Return selected</span>
              <button type="button" onClick={() => proceed(outboundResults.find((f) => f.id === selectedOut), null, inboundResults.find((f) => f.id === selectedIn))}>Continue</button>
            </div>
          )}
        </section>
      </div>

      <FareModal
        open={Boolean(fareFor)}
        onClose={() => setFareFor(null)}
        flight={fareFor}
        from={from}
        to={to}
        onContinue={(tier) => proceed(fareFor, tier)}
      />
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className={styles.empty}>
      <strong>No flights match your filters</strong>
      <p>Try adjusting your price range or clearing some filters.</p>
      <button type="button" onClick={onReset}>Reset all filters</button>
    </div>
  );
}
