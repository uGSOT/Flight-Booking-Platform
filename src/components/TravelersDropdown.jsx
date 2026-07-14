import { useEffect, useRef, useState } from "react";
import { User, Chevron } from "./icons.jsx";
import styles from "./TravelersDropdown.module.css";

const CLASSES = ["Economy", "Premium Economy", "Business Class", "First Class"];

const ROWS = [
  { key: "adults", label: "Adults", sub: "12+ Years", min: 1 },
  { key: "children", label: "Children", sub: "2 - 12 Years", min: 0 },
  { key: "infants", label: "Infants", sub: "Below 2 Years", min: 0 },
];

export default function TravelersDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const total = value.adults + value.children + value.infants;
  const summary = `${total} ${total === 1 ? "Traveller" : "Travellers"}, ${value.travelClass}`;

  function step(key, delta, min) {
    const next = Math.max(min, value[key] + delta);
    onChange({ ...value, [key]: next });
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((o) => !o)}>
        <User size={16} />
        <span>{summary}</span>
        <Chevron size={16} />
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Travellers and class">
          {ROWS.map((row) => (
            <div key={row.key} className={styles.row}>
              <div>
                <strong>{row.label}</strong>
                <small>{row.sub}</small>
              </div>
              <div className={styles.stepper}>
                <button
                  type="button"
                  onClick={() => step(row.key, -1, row.min)}
                  disabled={value[row.key] <= row.min}
                  aria-label={`Decrease ${row.label}`}
                >
                  −
                </button>
                <span>{value[row.key]}</span>
                <button type="button" onClick={() => step(row.key, 1, row.min)} aria-label={`Increase ${row.label}`}>
                  +
                </button>
              </div>
            </div>
          ))}

          <div className={styles.classes}>
            {CLASSES.map((c) => (
              <button
                key={c}
                type="button"
                className={value.travelClass === c ? styles.classActive : styles.classChip}
                onClick={() => onChange({ ...value, travelClass: c })}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
