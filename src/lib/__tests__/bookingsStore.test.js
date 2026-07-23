import { nextRef, saveBooking, listBookings, getBooking, updateBookingStatus } from "../bookingsStore.js";

beforeEach(() => localStorage.clear());

describe("nextRef", () => {
  it("generates sequential BK-YYYY-#### references", () => {
    const a = nextRef();
    const b = nextRef();
    expect(a).toMatch(/^BK-\d{4}-\d{4}$/);
    expect(a).not.toBe(b);
  });
});

describe("saveBooking / listBookings", () => {
  it("saves and lists bookings (newest first)", () => {
    saveBooking({ ref: "BK-1", userPhone: "+91111", status: "confirmed", amount: 100 });
    saveBooking({ ref: "BK-2", userPhone: "+91222", status: "confirmed", amount: 200 });
    const all = listBookings();
    expect(all).toHaveLength(2);
    expect(all[0].ref).toBe("BK-2"); // unshifted → newest first
  });

  it("filters by phone when provided", () => {
    saveBooking({ ref: "A", userPhone: "+91111" });
    saveBooking({ ref: "B", userPhone: "+91222" });
    expect(listBookings({ phone: "+91111" })).toHaveLength(1);
    expect(listBookings({}).length).toBe(2);
  });

  it("returns [] on corrupt storage", () => {
    localStorage.setItem("airme.bookings", "{not json");
    expect(listBookings()).toEqual([]);
  });
});

describe("getBooking", () => {
  it("finds by ref or returns null", () => {
    saveBooking({ ref: "BK-9", status: "confirmed" });
    expect(getBooking("BK-9").ref).toBe("BK-9");
    expect(getBooking("nope")).toBeNull();
  });
});

describe("updateBookingStatus", () => {
  it("updates an existing booking", () => {
    saveBooking({ ref: "BK-5", status: "confirmed" });
    const updated = updateBookingStatus("BK-5", "cancelled");
    expect(updated.status).toBe("cancelled");
    expect(getBooking("BK-5").status).toBe("cancelled");
  });
  it("no-ops for an unknown ref", () => {
    expect(updateBookingStatus("ghost", "cancelled")).toBeUndefined();
  });
});
