import { createContext, useContext, useMemo, useState, useCallback } from "react";

const BookingContext = createContext(null);
const DRAFT_KEY = "airme.bookingDraft";

const emptyDraft = {
  trip: null, // { from, to, depart, ret, tripType, adults, children, infants, cabin }
  flight: null, // selected outbound flight
  returnFlight: null,
  fareTier: null, // 'saver' | 'regular' | 'flexi'
  passengers: [],
  contact: { email: "", phone: "" },
  seats: [], // add-on seats
  meals: [], // add-on meals
  promoCode: "GIRUSH",
  discountAmount: 380, // fixed demo discount (PRD D5)
};

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? { ...emptyDraft, ...JSON.parse(raw) } : { ...emptyDraft };
  } catch {
    return { ...emptyDraft };
  }
}

export function BookingProvider({ children }) {
  const [draft, setDraft] = useState(loadDraft);

  const update = useCallback((patch) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* sessionStorage may be unavailable — non-fatal */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    sessionStorage.removeItem(DRAFT_KEY);
    setDraft({ ...emptyDraft });
  }, []);

  const total = useMemo(() => computeTotal(draft), [draft]);

  const value = useMemo(
    () => ({ draft, update, reset, total }),
    [draft, update, reset, total]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

function computeTotal(draft) {
  const base = draft.fareTier?.price ?? draft.flight?.price ?? 0;
  const seats = (draft.seats || []).reduce((s, x) => s + (x.amount || 0), 0);
  const meals = (draft.meals || []).reduce((s, x) => s + (x.amount || 0), 0);
  const discount = draft.discountAmount || 0;
  return Math.max(0, base + seats + meals - discount);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within <BookingProvider>");
  return ctx;
}
