import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TravelersDropdown from "../../components/TravelersDropdown.jsx";
import {
  PlaneDepart, PlaneArrive, Swap, Calendar, ArrowUpRight, OneWay, RoundTrip,
  Search, Compare, Book, MapPin,
} from "../../components/icons.jsx";
import styles from "./LandingPage.module.css";

import heroPlane from "../../assets/images/hero-plane.png";
import luggage from "../../assets/images/luggage.png";
import rDelhiMumbai from "../../assets/images/route-delhi-mumbai.png";
import rMumbaiGoa from "../../assets/images/route-mumbai-goa.png";
import rBangaloreDelhi from "../../assets/images/route-bangalore-delhi.png";
import rHyderabadBangalore from "../../assets/images/route-hyderabad-bangalore.png";
import rKolkataDelhi from "../../assets/images/route-kolkata-delhi.png";
import rChennaiMumbai from "../../assets/images/route-chennai-mumbai.png";
import offerSale from "../../assets/images/offer-sale.png";
import offerBank from "../../assets/images/offer-bank.png";
import offerIntl from "../../assets/images/offer-international.png";
import offerWeekend from "../../assets/images/offer-weekend.png";
import lVistara from "../../assets/images/airline-vistara.png";
import lIndigo from "../../assets/images/airline-indigo.png";
import lAirIndia from "../../assets/images/airline-airindia.png";
import lSpicejet from "../../assets/images/airline-spicejet.png";
import lAirAsia from "../../assets/images/airline-airasia.png";
import lAirIndiaExpress from "../../assets/images/airline-airindiaexpress.png";
import lAkasa from "../../assets/images/airline-akasa.png";

const POPULAR = ["DEL - BOM", "DEL - HYD", "BLR - BOM", "DEL - BLR", "BLR - CCU"];

const ROUTES = [
  { route: "Delhi - Mumbai", from: 2899, dur: "1h 55m", perDay: 98, img: rDelhiMumbai },
  { route: "Mumbai - Goa", from: 3299, dur: "1h 25m", perDay: 75, img: rMumbaiGoa },
  { route: "Bangalore - Delhi", from: 2799, dur: "2h 35m", perDay: 82, img: rBangaloreDelhi },
  { route: "Hyderabad - Bangalore", from: 3199, dur: "1h 10m", perDay: 65, img: rHyderabadBangalore },
  { route: "Kolkata - Delhi", from: 3499, dur: "2h 40m", perDay: 60, img: rKolkataDelhi },
  { route: "Chennai - Mumbai", from: 3599, dur: "2h 40m", perDay: 61, img: rChennaiMumbai },
];

const STEPS = [
  { icon: Search, title: "Search", copy: "Find the best flights that suits your plan" },
  { icon: Compare, title: "Compare", copy: "Compare prices, timings and airlines" },
  { icon: Book, title: "Book", copy: "Choose your flight and book securely" },
  { icon: MapPin, title: "Fly & Enjoy", copy: "Get your e-ticket and enjoy your trip" },
];

const OFFERS = [
  { tag: "SALE", tagColor: "#d64545", title: "Super Saver Sale", copy: "up to ₹2,000 off on domestic flights", cta: "Book Now", ctaColor: "#e8763a", img: offerSale, dark: true },
  { tag: "BANK OFFER", tagColor: "#1a9e5f", title: "Flat 10 % Instant Discount", copy: "On select bank cards", cta: "View Details", ctaColor: "#1a9e5f", img: offerBank, dark: false },
  { tag: "FLY ABROAD", tagColor: "#2b6cb0", title: "International Flights", copy: "Starting at ₹8,999", cta: "Explore Now", ctaColor: "#2b4c7e", img: offerIntl, dark: true },
  { tag: "WEEKEND DEALS", tagColor: "#2b6cb0", title: "Special fares for weekend getaways", copy: "", cta: "Book Now", ctaColor: "#2b6cb0", img: offerWeekend, dark: true },
];

const AIRLINE_LOGOS = [
  { name: "Vistara", src: lVistara },
  { name: "IndiGo", src: lIndigo },
  { name: "Air India", src: lAirIndia },
  { name: "SpiceJet", src: lSpicejet },
  { name: "Air Asia", src: lAirAsia },
  { name: "Air India Express", src: lAirIndiaExpress },
  { name: "Akasa Air", src: lAkasa },
];

const WHY = [
  { title: "Best Price Guarantee", copy: "We ensure you get the best price" },
  { title: "24/7 Support", copy: "Always here to help before, during & after your trip" },
  { title: "Secure Booking", copy: "Your data and payment are 100% secure" },
  { title: "Easy Changes", copy: "Hassle-free data changes and flexible options" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("one_way");
  const [travelers, setTravelers] = useState({ adults: 1, children: 0, infants: 0, travelClass: "Economy" });
  const [fields, setFields] = useState({ from: "", to: "", depart: "", ret: "" });

  function setField(k, v) {
    setFields((f) => ({ ...f, [k]: v }));
  }
  function swap() {
    setFields((f) => ({ ...f, from: f.to, to: f.from }));
  }

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams({
      from: fields.from,
      to: fields.to,
      depart: fields.depart,
      ret: tripType === "round" ? fields.ret : "",
      tripType,
      adults: travelers.adults,
      children: travelers.children,
      infants: travelers.infants,
      cabin: travelers.travelClass,
    });
    navigate(`/flights?${params.toString()}`);
  }

  return (
    <div>
      {/* HERO */}
      <section className={styles.hero}>
        <img className={styles.heroBg} src={heroPlane} alt="" aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.eyebrow}>FLY MORE, WORRY LESS</span>
          <h1 className={styles.title}>
            Your Journey,<br />
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
                <OneWay size={16} /> One way
              </button>
              <button
                type="button"
                className={tripType === "round" ? styles.tripActive : styles.tripBtn}
                onClick={() => setTripType("round")}
              >
                <RoundTrip size={16} /> Round trip
              </button>
            </div>

            <div className={styles.fields}>
              <div className={styles.fromTo}>
                <label className={styles.field}>
                  <span>From</span>
                  <div className={styles.inputRow}>
                    <PlaneDepart size={18} />
                    <input value={fields.from} onChange={(e) => setField("from", e.target.value)} placeholder="Where from?" />
                  </div>
                </label>
                <button type="button" className={styles.swapBtn} onClick={swap} aria-label="Swap origin and destination">
                  <Swap size={18} />
                </button>
                <label className={styles.field}>
                  <span>To</span>
                  <div className={styles.inputRow}>
                    <PlaneArrive size={18} />
                    <input value={fields.to} onChange={(e) => setField("to", e.target.value)} placeholder="Where to?" />
                  </div>
                </label>
              </div>

              <label className={styles.field}>
                <span>Depart</span>
                <div className={styles.inputRow}>
                  <Calendar size={18} />
                  <input type="date" value={fields.depart} onChange={(e) => setField("depart", e.target.value)} />
                </div>
              </label>

              <label className={styles.field}>
                <span>Return {tripType === "one_way" && "(optional)"}</span>
                <div className={styles.inputRow}>
                  <Calendar size={18} />
                  <input
                    type="date"
                    value={fields.ret}
                    onChange={(e) => setField("ret", e.target.value)}
                    disabled={tripType === "one_way"}
                  />
                </div>
              </label>

              <div className={styles.field}>
                <span>Travelers &amp; Class</span>
                <div className={styles.inputRow}>
                  <TravelersDropdown value={travelers} onChange={setTravelers} />
                </div>
              </div>

              <button type="submit" className={styles.searchBtn}>
                Search Flights <ArrowUpRight size={16} />
              </button>
            </div>

            <div className={styles.popular}>
              <span>Popular searches:</span>
              {POPULAR.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={styles.chip}
                  onClick={() => {
                    const [f, t] = p.split(" - ");
                    setFields((prev) => ({ ...prev, from: f, to: t }));
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* POPULAR FLIGHT ROUTES */}
      <section className="container" style={{ paddingBlock: "var(--space-12)" }}>
        <h2 className={styles.sectionTitle}>Popular Flight Routes</h2>
        <div className={styles.routeGrid}>
          {ROUTES.map((r) => (
            <button type="button" key={r.route} className={styles.routeCard} onClick={handleSearch}>
              <div className={styles.routeThumb}>
                <img src={r.img} alt={r.route} loading="lazy" />
              </div>
              <div className={styles.routeBody}>
                <strong>{r.route}</strong>
                <span className={`${styles.routePrice} tabular`}>From ₹{r.from.toLocaleString("en-IN")}</span>
                <small>{r.dur} · {r.perDay} flights/day</small>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container">
        <div className={styles.howItWorks}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.howBody}>
            <div className={styles.steps}>
              {STEPS.map((s, i) => (
                <div key={s.title} className={styles.step}>
                  <span className={styles.stepIcon}><s.icon size={18} /></span>
                  <strong>{s.title}</strong>
                  <small>{s.copy}</small>
                  {i < STEPS.length - 1 && <span className={styles.dash} aria-hidden="true" />}
                </div>
              ))}
            </div>
            <img className={styles.luggage} src={luggage} alt="" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* BEST OFFERS */}
      <section className="container" style={{ paddingBlock: "var(--space-12)" }}>
        <h2 className={styles.sectionTitle}>Best offers for You</h2>
        <div className={styles.offerGrid}>
          {OFFERS.map((o) => (
            <div key={o.title} className={`${styles.offerCard} ${o.dark ? styles.offerDark : styles.offerLight}`}>
              <img className={styles.offerBg} src={o.img} alt="" aria-hidden="true" />
              <div className={styles.offerContent}>
                <span className={styles.offerTag} style={{ color: o.tagColor }}>{o.tag}</span>
                <strong className={styles.offerTitle}>{o.title}</strong>
                {o.copy && <p className={styles.offerCopy}>{o.copy}</p>}
                <button type="button" className={styles.offerBtn} style={{ background: o.ctaColor }}>{o.cta}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE AIRME */}
      <section className="container" style={{ paddingBottom: "var(--space-12)" }}>
        <h2 className={styles.sectionTitle}>Why choose AirMe?</h2>
        <div className={styles.whyGrid}>
          {WHY.map((w) => (
            <div key={w.title} className={styles.whyItem}>
              <span className={styles.whyIcon}><Search size={18} /></span>
              <div>
                <strong>{w.title}</strong>
                <p>{w.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUSTED BY AIRLINES */}
      <section className="container" style={{ paddingBottom: "var(--space-16)" }}>
        <h2 className={styles.trustedTitle}>Trusted by 100+ Airlines</h2>
        <div className={styles.airlineRow}>
          {AIRLINE_LOGOS.map((a) => (
            <img key={a.name} className={styles.airline} src={a.src} alt={a.name} loading="lazy" />
          ))}
        </div>
      </section>
    </div>
  );
}
