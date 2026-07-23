import { fareTiers } from "../fares.js";

describe("fareTiers", () => {
  const tiers = fareTiers({ price: 7000 });

  it("returns three tiers keyed saver/regular/flexi", () => {
    expect(tiers.map((t) => t.key)).toEqual(["saver", "regular", "flexi"]);
  });

  it("prices scale from the base fare", () => {
    expect(tiers[0].price).toBe(7000);
    expect(tiers[1].price).toBe(Math.round(7000 * 1.074));
    expect(tiers[2].price).toBe(Math.round(7000 * 1.231));
  });

  it("marks only the regular tier as recommended", () => {
    expect(tiers[0].recommended).toBe(false);
    expect(tiers[1].recommended).toBe(true);
    expect(tiers[2].recommended).toBe(false);
  });

  it("saver has chargeable seat + paid meals; regular/flexi are free", () => {
    const saverSeat = tiers[0].rows.find((r) => r.group === "Change Seat").items[0];
    const regularSeat = tiers[1].rows.find((r) => r.group === "Change Seat").items[0];
    expect(saverSeat.ok).toBe(false);
    expect(saverSeat.text).toMatch(/Chargeable/);
    expect(regularSeat.ok).toBe(true);
    expect(regularSeat.text).toMatch(/Free/);
  });

  it("flexi bumps check-in baggage to 20kg", () => {
    const flexiBag = tiers[2].rows.find((r) => r.group === "Baggage").items[1];
    expect(flexiBag.text).toMatch(/20 Kgs/);
  });

  it("every tier lists chargeable flexible options", () => {
    for (const t of tiers) {
      const flex = t.rows.find((r) => r.group === "Flexible Options");
      expect(flex.items.every((i) => i.ok === false)).toBe(true);
    }
  });
});
