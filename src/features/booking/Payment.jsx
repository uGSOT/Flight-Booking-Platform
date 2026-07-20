import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatINR } from "../../lib/format.js";
import { nextRef, saveBooking } from "../../lib/bookingsStore.js";
import { PAYMENTS_MOCK } from "../../lib/razorpay.js";
import { ArrowLeft } from "../../components/icons.jsx";
import TripSummary from "./TripSummary.jsx";
import EmptyBooking from "./EmptyBooking.jsx";
import styles from "./Payment.module.css";

export default function Payment() {
  const { draft, total, reset } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { flight, trip } = draft;

  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upi, setUpi] = useState("");
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!flight || !trip) return <EmptyBooking />;

  const breakdown = [
    { label: `Base fare (${draft.fareTier?.key || "fare"})`, amount: draft.fareTier?.price ?? flight.price },
    ...(draft.seats || []).map((s) => ({ label: `Seat ${s.label}`, amount: s.amount })),
    ...(draft.meals || []).map((m) => ({ label: m.label, amount: m.amount })),
    { label: `Promo (${draft.promoCode})`, amount: -(draft.discountAmount || 0) },
  ];

  function pay() {
    setError("");
    if (!agree) { setError("Please accept the terms to continue."); return; }
    if (method === "card" && (card.number.replace(/\s/g, "").length < 12 || !card.cvv || !card.name)) {
      setError("Enter valid card details."); return;
    }
    if (method === "upi" && !upi.includes("@")) { setError("Enter a valid UPI ID."); return; }

    setProcessing(true);
    // Demo: simulate gateway capture. Real flow verifies via Razorpay webhook
    // server-side before confirming (Architecture §6). PAYMENTS_MOCK short-circuits.
    const delay = PAYMENTS_MOCK ? 400 : 1600;
    setTimeout(() => {
      const ref = nextRef();
      saveBooking({
        ref,
        userPhone: user?.phone || "guest",
        flight: draft.flight,
        returnFlight: draft.returnFlight,
        trip: draft.trip,
        fareTier: draft.fareTier,
        passengers: draft.passengers,
        contact: draft.contact,
        seats: draft.seats,
        meals: draft.meals,
        amount: total,
        promoCode: draft.promoCode,
        discountAmount: draft.discountAmount,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });
      reset();
      navigate(`/booking/confirmation/${ref}`);
    }, delay);
  }

  return (
    <div>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Add-ons
      </button>

      <div className={styles.layout}>
        <div>
          <section className={styles.panel}>
            <h2>Payment</h2>
            <div className={styles.tabs}>
              <button type="button" className={method === "card" ? styles.tabActive : styles.tab} onClick={() => setMethod("card")}>Card</button>
              <button type="button" className={method === "upi" ? styles.tabActive : styles.tab} onClick={() => setMethod("upi")}>UPI</button>
            </div>

            {method === "card" ? (
              <div className={styles.form}>
                <label className={styles.field}>
                  <span>Card Number</span>
                  <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="1234 5678 9012 3456" inputMode="numeric" />
                </label>
                <div className={styles.row}>
                  <label className={styles.field}><span>Expiry</span><input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" /></label>
                  <label className={styles.field}><span>CVV</span><input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="123" inputMode="numeric" maxLength={4} /></label>
                </div>
                <label className={styles.field}><span>Name on Card</span><input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Full name" /></label>
              </div>
            ) : (
              <div className={styles.form}>
                <label className={styles.field}><span>UPI ID</span><input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="yourname@bank" /></label>
              </div>
            )}

            <label className={styles.terms}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I agree to the fare rules, terms of use and privacy policy.
            </label>
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.secure}>🔒 Payments are processed securely via Razorpay {PAYMENTS_MOCK && "(sandbox)"}.</div>
          </section>

          <section className={styles.panel}>
            <h2>Price breakdown</h2>
            <table className={styles.table}>
              <tbody>
                {breakdown.map((r, i) => (
                  <tr key={i}><td>{r.label}</td><td className={`tabular ${r.amount < 0 ? styles.neg : ""}`}>{r.amount < 0 ? `– ${formatINR(-r.amount)}` : formatINR(r.amount)}</td></tr>
                ))}
                <tr className={styles.grand}><td>Total payable</td><td className="tabular">{formatINR(total)}</td></tr>
              </tbody>
            </table>
          </section>
        </div>

        <div>
          <TripSummary draft={draft} />
          <button type="button" className={styles.payBtn} onClick={pay} disabled={processing}>
            {processing ? "Processing…" : `Pay ${formatINR(total)}`}
          </button>
        </div>
      </div>

      {processing && (
        <div className={styles.processing}>
          <div className={styles.spinner} />
          <p>Processing your payment…</p>
        </div>
      )}
    </div>
  );
}
