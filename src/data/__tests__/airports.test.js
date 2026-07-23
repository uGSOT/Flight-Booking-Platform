import { AIRPORTS, resolveAirport } from "../airports.js";

describe("AIRPORTS", () => {
  it("has the expected seed airports", () => {
    expect(AIRPORTS.DEL.city).toBe("Delhi");
    expect(AIRPORTS.BOM.name).toMatch(/Chhatrapati/);
    expect(Object.keys(AIRPORTS).length).toBeGreaterThanOrEqual(7);
  });
});

describe("resolveAirport", () => {
  it("returns null for empty input", () => {
    expect(resolveAirport("")).toBeNull();
    expect(resolveAirport(null)).toBeNull();
    expect(resolveAirport(undefined)).toBeNull();
  });
  it("resolves by IATA code (any case)", () => {
    expect(resolveAirport("DEL").city).toBe("Delhi");
    expect(resolveAirport("del").city).toBe("Delhi");
    expect(resolveAirport("  bom  ").code).toBe("BOM");
  });
  it("resolves by city name (any case)", () => {
    expect(resolveAirport("Delhi").code).toBe("DEL");
    expect(resolveAirport("mumbai").code).toBe("BOM");
  });
  it("falls back to a synthetic airport for unknown input", () => {
    const a = resolveAirport("Zzz Town");
    expect(a.code).toBe("ZZZ");
    expect(a.city).toBe("Zzz Town");
    expect(a.name).toBe("");
  });
});
