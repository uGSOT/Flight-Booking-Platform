import { useState } from "react";
import Modal from "../../components/Modal.jsx";
import { minutesToTime } from "../../lib/mockFlights.js";
import { formatINR, formatDuration } from "../../lib/format.js";
import { fareTiers } from "../../lib/fares.js";
import { Plane, Check, Minus } from "../../components/icons.jsx";
import styles from "./FareModal.module.css";

export default function FareModal({ open, onClose, flight, from, to, onContinue }) {
  const [selected, setSelected] = useState("saver");
  if (!flight) return null;
  const tiers = fareTiers(flight);
  const current = tiers.find((t) => t.key === selected) || tiers[0];

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className={styles.head}>
        <h2>Choose Your Fare</h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className={styles.strip}>
        <span className={styles.logo} style={{ background: flight.airlineColor }}><Plane size={16} /></span>
        <div className={styles.al}><strong>{flight.airlineName}</strong><small>{flight.flightNo}</small></div>
        <div className={styles.leg}><span className={styles.t}>{minutesToTime(flight.depMin)}</span><span>{from?.code}</span></div>
        <div className={styles.mid}><span>{formatDuration(flight.durationMin)}</span><Plane size={14} /><span className={styles.ns}>{flight.stops === 0 ? "Non-Stop" : `${flight.stops} Stop`}</span></div>
        <div className={styles.leg}><span className={styles.t}>{minutesToTime(flight.arrMin)}</span><span>{to?.code}</span></div>
      </div>

      <div className={styles.cards}>
        {tiers.map((tier) => {
          const isSel = tier.key === selected;
          const dark = tier.recommended && tier.key === "regular";
          return (
            <div key={tier.key} className={`${styles.card} ${dark ? styles.dark : ""} ${isSel ? styles.selCard : ""}`}>
              {tier.recommended && tier.key === "regular" && <span className={styles.ribbon}>Recommended Fare</span>}
              <div className={styles.price}>
                <strong className="tabular">{formatINR(tier.price)}</strong> per adult
                <span className={styles.off}>₹380 OFF using GIRUSH code</span>
              </div>
              {tier.rows.map((r) => (
                <div key={r.group} className={styles.grp}>
                  <span className={styles.grpTitle}>{r.group}</span>
                  {r.items.map((it, i) => (
                    <div key={i} className={styles.feat}>
                      <span className={it.ok ? styles.ok : styles.no}>{it.ok ? <Check size={14} /> : <Minus size={14} />}</span>
                      <span>{it.text}</span>
                    </div>
                  ))}
                </div>
              ))}
              <button type="button" className={`${styles.selBtn} ${isSel ? styles.selBtnActive : ""}`} onClick={() => setSelected(tier.key)}>
                {isSel ? <>✓ Selected</> : "Select"}
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          <strong className="tabular">{formatINR(current.price - 380)}</strong>
          <span className={styles.off}>₹380 OFF using GIRUSH code</span>
        </div>
        <button type="button" className={styles.continue} onClick={() => onContinue(current)}>Continue</button>
      </div>
    </Modal>
  );
}
