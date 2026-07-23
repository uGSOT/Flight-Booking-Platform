import { formatINR, formatDate, formatDayDate, formatDuration } from "../format.js";

describe("formatINR", () => {
  it("formats a number as INR", () => {
    expect(formatINR(7070)).toContain("7,070");
    expect(formatINR(7070).startsWith("₹")).toBe(true);
  });
  it("returns em dash for null/undefined/NaN", () => {
    expect(formatINR(null)).toBe("—");
    expect(formatINR(undefined)).toBe("—");
    expect(formatINR(NaN)).toBe("—");
    expect(formatINR("abc")).toBe("—");
  });
  it("handles zero", () => {
    expect(formatINR(0)).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats an ISO string", () => {
    expect(formatDate("2026-07-02")).toMatch(/Jul/);
  });
  it("formats a Date instance", () => {
    expect(formatDate(new Date("2026-07-02"))).toMatch(/2026/);
  });
  it("returns em dash for falsy or invalid", () => {
    expect(formatDate("")).toBe("—");
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatDayDate", () => {
  it("formats weekday + day + month", () => {
    const out = formatDayDate("2026-07-02");
    expect(out).toMatch(/Jul/);
    expect(out).toMatch(/02/);
  });
  it("accepts a Date and rejects invalid", () => {
    expect(formatDayDate(new Date("2026-07-02"))).toMatch(/Jul/);
    expect(formatDayDate("")).toBe("—");
    expect(formatDayDate("bad")).toBe("—");
  });
});

describe("formatDuration", () => {
  it("formats minutes as Xh YYm", () => {
    expect(formatDuration(140)).toBe("2h 20m");
    expect(formatDuration(65)).toBe("1h 05m");
  });
  it("returns em dash for null/undefined", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(undefined)).toBe("—");
  });
});
