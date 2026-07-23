import { minutesToTime, timeBucket, generateFlights } from "../mockFlights.js";

describe("minutesToTime", () => {
  it("formats minutes-from-midnight as HH:MM", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(380)).toBe("06:20");
    expect(minutesToTime(1439)).toBe("23:59");
  });
  it("wraps values outside a day", () => {
    expect(minutesToTime(1440)).toBe("00:00");
    expect(minutesToTime(-60)).toBe("23:00");
  });
});

describe("timeBucket", () => {
  it("maps each part of the day", () => {
    expect(timeBucket(0)).toBe("early");
    expect(timeBucket(9 * 60)).toBe("morning");
    expect(timeBucket(13 * 60)).toBe("afternoon");
    expect(timeBucket(18 * 60)).toBe("evening");
    expect(timeBucket(22 * 60)).toBe("night");
  });
  it("wraps negative/overflow values", () => {
    expect(timeBucket(-120)).toBe("night");
  });
});

describe("generateFlights", () => {
  it("returns the requested count (default 16)", () => {
    expect(generateFlights({ from: "DEL", to: "BOM", depart: "2026-07-02" })).toHaveLength(16);
    expect(generateFlights({ from: "DEL", to: "BOM", depart: "x", count: 5 })).toHaveLength(5);
  });

  it("is deterministic for the same seed", () => {
    const a = generateFlights({ from: "DEL", to: "BOM", depart: "2026-07-02" });
    const b = generateFlights({ from: "DEL", to: "BOM", depart: "2026-07-02" });
    expect(a).toEqual(b);
  });

  it("differs for different routes", () => {
    const a = generateFlights({ from: "DEL", to: "BOM", depart: "d" });
    const b = generateFlights({ from: "BLR", to: "CCU", depart: "d" });
    expect(a).not.toEqual(b);
  });

  it("produces valid, varied flights (covers stops + promo branches)", () => {
    const flights = generateFlights({ from: "DEL", to: "BOM", depart: "seed", count: 300 });
    const stops = new Set(flights.map((f) => f.stops));
    expect(stops.has(0)).toBe(true);
    expect(stops.has(1)).toBe(true);
    expect(stops.has(2)).toBe(true);
    expect(flights.some((f) => f.promo)).toBe(true);
    expect(flights.some((f) => f.promo === null)).toBe(true);
    for (const f of flights) {
      expect(f.price).toBeGreaterThanOrEqual(2500);
      expect(f.price).toBeLessThanOrEqual(18000);
      expect(f.arrMin).toBe(f.depMin + f.durationMin);
      expect(f.flightNo).toContain("-");
    }
  });

  it("works with undefined route params", () => {
    expect(generateFlights({}).length).toBe(16);
  });
});
