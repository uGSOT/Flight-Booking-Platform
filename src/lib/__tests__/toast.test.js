import { toast, subscribeToasts, dismissToast } from "../toast.js";

describe("toast store", () => {
  let seen;
  let unsub;
  beforeEach(() => {
    jest.useFakeTimers();
    seen = [];
    unsub = subscribeToasts((t) => { seen = t; });
    // clear any leftovers from prior tests
    [...seen].forEach((t) => dismissToast(t.id));
  });
  afterEach(() => {
    unsub();
    jest.useRealTimers();
  });

  it("notifies subscribers immediately on subscribe", () => {
    expect(Array.isArray(seen)).toBe(true);
  });

  it("pushes a success toast and auto-dismisses after 4s", () => {
    toast.success("Saved");
    expect(seen.some((t) => t.message === "Saved" && t.type === "success")).toBe(true);
    jest.advanceTimersByTime(4000);
    expect(seen.some((t) => t.message === "Saved")).toBe(false);
  });

  it("errors persist longer (6s)", () => {
    const before = seen.length;
    toast.error("Boom");
    expect(seen.length).toBe(before + 1);
    jest.advanceTimersByTime(4000);
    expect(seen.some((t) => t.message === "Boom")).toBe(true); // still there at 4s
    jest.advanceTimersByTime(2000);
    expect(seen.some((t) => t.message === "Boom")).toBe(false);
  });

  it("supports info and warning types", () => {
    toast.info("i");
    toast.warning("w");
    expect(seen.some((t) => t.type === "info")).toBe(true);
    expect(seen.some((t) => t.type === "warning")).toBe(true);
  });

  it("honours a custom duration and duration:0 disables auto-dismiss", () => {
    toast.success("custom", { duration: 1000 });
    toast.info("sticky", { duration: 0 });
    jest.advanceTimersByTime(1000);
    expect(seen.some((t) => t.message === "custom")).toBe(false);
    jest.advanceTimersByTime(100000);
    expect(seen.some((t) => t.message === "sticky")).toBe(true);
  });

  it("dismissToast removes a specific toast", () => {
    toast.success("bye", { duration: 0 });
    const t = seen.find((x) => x.message === "bye");
    dismissToast(t.id);
    expect(seen.some((x) => x.message === "bye")).toBe(false);
  });
});
