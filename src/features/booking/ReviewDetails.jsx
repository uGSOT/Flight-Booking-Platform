import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { AIRPORTS } from "../../data/airports.js";
import { minutesToTime } from "../../lib/mockFlights.js";
import { formatDayDate, formatDuration } from "../../lib/format.js";
import { Plane, User, Calendar, Chevron, ArrowLeft, Mail, Phone } from "../../components/icons.jsx";
import TripSummary from "./TripSummary.jsx";
import BookingFooter from "./BookingFooter.jsx";
import EmptyBooking from "./EmptyBooking.jsx";
import styles from "./ReviewDetails.module.css";

function buildPassengers(trip) {
  const list = [];
  for (let i = 0; i < (trip.adults || 1); i++) list.push({ type: "Adult", label: `Adult ${i + 1}` });
  for (let i = 0; i < (trip.children || 0); i++) list.push({ type: "Child", label: `Child ${i + 1}` });
  for (let i = 0; i < (trip.infants || 0); i++) list.push({ type: "Infant", label: `Infant ${i + 1}` });
  return list.map((p) => ({ ...p, firstName: "", lastName: "", dob: "", gender: "" }));
}

export default function ReviewDetails() {
  const { draft, update, total } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { flight, trip } = draft;
  const initialPax = useMemo(
    () => (draft.passengers?.length ? draft.passengers : trip ? buildPassengers(trip) : []),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [passengers, setPassengers] = useState(initialPax);
  const [contact, setContact] = useState(() => draft.contact?.phone ? draft.contact : { email: "", phone: user?.phone || "" });
  const [errors, setErrors] = useState({});

  if (!flight || !trip) return <EmptyBooking />;

  const origin = AIRPORTS[trip.from] || { code: trip.from, name: "" };
  const dest = AIRPORTS[trip.to] || { code: trip.to, name: "" };

  function setPax(i, field, value) {
    setPassengers((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  function validateAndNext() {
    const errs = {};
    passengers.forEach((p, i) => {
      if (!p.firstName.trim()) errs[`p${i}-firstName`] = true;
      if (!p.lastName.trim()) errs[`p${i}-lastName`] = true;
      if (!p.gender) errs[`p${i}-gender`] = true;
    });
    if (!contact.phone.trim()) errs["phone"] = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    update({ passengers, contact });
    navigate("/booking/addons");
  }

  return (
    <div>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Flight selection
      </button>

      {/* Flight summary strip */}
      <div className={styles.strip}>
        <div className={styles.airline}>
          <span className={styles.logo} style={{ background: flight.airlineColor }}><Plane size={16} /></span>
          <div><strong>{flight.airlineName}</strong><small>{flight.flightNo}</small></div>
        </div>
        <div className={styles.leg}>
          <span className={styles.time}>{minutesToTime(flight.depMin)}</span>
          <span className={styles.code}>{origin.code} <em>({formatDayDate(trip.depart)})</em></span>
          <small>{origin.name}</small>
        </div>
        <div className={styles.mid}>
          <span>{formatDuration(flight.durationMin)}</span>
          <span className={styles.line}><Plane size={14} /></span>
          <span className={styles.nonstop}>{flight.stops === 0 ? "Non-Stop" : `${flight.stops} Stop`}</span>
        </div>
        <div className={styles.leg}>
          <span className={styles.time}>{minutesToTime(flight.arrMin)}</span>
          <span className={styles.code}>{dest.code} <em>({formatDayDate(trip.depart)})</em></span>
          <small>{dest.name}</small>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.forms}>
          {/* Traveller details */}
          <section className={styles.panel}>
            <h2>Traveller details</h2>
            {passengers.map((p, i) => (
              <div key={i} className={styles.pax}>
                <h3 className={styles.paxLabel}>{p.label}</h3>
                <div className={styles.grid}>
                  <Field label="First Name" error={errors[`p${i}-firstName`]}>
                    <span className={styles.inputRow}>
                      <User size={16} />
                      <input value={p.firstName} onChange={(e) => setPax(i, "firstName", e.target.value)} placeholder="Enter first name" />
                    </span>
                  </Field>
                  <Field label="Last Name" error={errors[`p${i}-lastName`]}>
                    <span className={styles.inputRow}>
                      <User size={16} />
                      <input value={p.lastName} onChange={(e) => setPax(i, "lastName", e.target.value)} placeholder="Enter last name" />
                    </span>
                  </Field>
                  <Field label="Date of Birth">
                    <span className={styles.inputRow}>
                      <Calendar size={16} />
                      <input type="date" value={p.dob} onChange={(e) => setPax(i, "dob", e.target.value)} />
                    </span>
                  </Field>
                  <Field label="Gender" required error={errors[`p${i}-gender`]}>
                    <span className={styles.inputRow}>
                      <select value={p.gender} onChange={(e) => setPax(i, "gender", e.target.value)}>
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                      <Chevron size={16} />
                    </span>
                  </Field>
                </div>
              </div>
            ))}
          </section>

          {/* Contact details */}
          <section className={styles.panel}>
            <h2>Contact details</h2>
            <div className={styles.grid}>
              <Field label="Email ID">
                <span className={styles.inputRow}>
                  <Mail size={16} />
                  <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Enter email address" />
                </span>
              </Field>
              <Field label="Phone Number" required error={errors["phone"]}>
                <span className={styles.inputRow}>
                  <Phone size={16} />
                  <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="Enter phone number" />
                </span>
              </Field>
            </div>
          </section>
        </div>

        <TripSummary draft={draft} />
      </div>

      <BookingFooter total={total} promo={draft.promoCode ? `₹${draft.discountAmount} OFF using ${draft.promoCode} code` : null} ctaLabel="Next" onNext={validateAndNext} />
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <label className={`${styles.field} ${error ? styles.fieldError : ""}`}>
      <span className={styles.label}>{label} {required && <em>*</em>}</span>
      {children}
    </label>
  );
}
