import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";

const POPULAR = ["DEL - BOM", "DEL - HYD", "BLR - BOM", "DEL - BLR", "BLR - CCU"];

const ROUTES = [
  { route: "Delhi - Mumbai", from: 2899, dur: "1h 55m", perDay: 98 },
  { route: "Mumbai - Goa", from: 3299, dur: "1h 25m", perDay: 75 },
  { route: "Bangalore - Delhi", from: 2799, dur: "2h 35m", perDay: 82 },
  { route: "Hyderabad - Bangalore", from: 3199, dur: "1h 10m", perDay: 65 },
  { route: "Kolkata - Delhi", from: 3499, dur: "2h 40m", perDay: 60 },
  { route: "Chennai - Mumbai", from: 3599, dur: "2h 40m", perDay: 61 },
];

const STEPS = [
  { title: "Search", copy: "Find the best flights that suit your plan" },
  { title: "Compare", copy: "Compare prices, timings and airlines" },
  { title: "Book", copy: "Choose your flight and book securely" },
  { title: "Fly & Enjoy", copy: "Get your e-ticket and enjoy your trip" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("one_way");

  function handleSearch(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams({
      from: form.get("from") || "",
      to: form.get("to") || "",
      depart: form.get("depart") || "",
      tripType,
    });
    navigate(`/flights?${params.toString()}`);
  }

  return (
    <div>
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>FLY MORE, WORRY LESS</span>
          <h1 className={styles.title}>
            Your Journey,
            <br />
            <span className={styles.accent}>Elevated.</span>
          </h1>
          <p className={styles.subcopy}>Search, compare and book flights at the best prices.</p>

          <form className={styles.searchCard} onSubmit={handleSearch}>
            <div className={styles.tripToggle}>
              <button
                type="button"
                className={tripType === "one_way" ? styles.tripActive : styles.tripBtn}
                onClick={() => setTripType("one_way")}
              >
                One way
              </button>
              <button
                type="button"
                className={tripType === "round" ? styles.tripActive : styles.tripBtn}
                onClick={() => setTripType("round")}
              >
                Round trip
              </button>
            </div>

            <div className={styles.fields}>
              <label className={styles.field}>
                <span>From</span>
                <input name="from" placeholder="Where from?" />
              </label>
              <label className={styles.field}>
                <span>To</span>
                <input name="to" placeholder="Where to?" />
              </label>
              <label className={styles.field}>
                <span>Depart</span>
                <input name="depart" type="date" />
              </label>
              <label className={styles.field}>
                <span>Return {tripType === "one_way" && "(optional)"}</span>
                <input name="return" type="date" disabled={tripType === "one_way"} />
              </label>
              <button type="submit" className={styles.searchBtn}>Search Flights</button>
            </div>

            <div className={styles.popular}>
              <span>Popular searches:</span>
              {POPULAR.map((p) => (
                <span key={p} className={styles.chip}>{p}</span>
              ))}
            </div>
          </form>
        </div>
      </section>

      <section className="container" style={{ paddingBlock: "var(--space-12)" }}>
        <h2 className={styles.sectionTitle}>Popular Flight Routes</h2>
        <div className={styles.routeGrid}>
          {ROUTES.map((r) => (
            <div key={r.route} className={styles.routeCard}>
              <div className={styles.routeThumb} aria-hidden="true" />
              <div className={styles.routeBody}>
                <strong>{r.route}</strong>
                <span className="tabular">From ₹{r.from.toLocaleString("en-IN")}</span>
                <small>{r.dur} · {r.perDay} flights/day</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.title} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <strong>{s.title}</strong>
                <small>{s.copy}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
