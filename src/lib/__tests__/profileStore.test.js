import { getProfile, saveProfile } from "../profileStore.js";

beforeEach(() => localStorage.clear());

describe("profileStore", () => {
  it("returns null when no profile is stored", () => {
    expect(getProfile("+91999")).toBeNull();
  });

  it("saves and retrieves a profile by phone", () => {
    const p = { firstName: "Priya", phone: "+91999" };
    const saved = saveProfile("+91999", p);
    expect(saved).toEqual(p);
    expect(getProfile("+91999")).toEqual(p);
  });

  it("keeps profiles separate per phone", () => {
    saveProfile("+91111", { firstName: "A" });
    saveProfile("+91222", { firstName: "B" });
    expect(getProfile("+91111").firstName).toBe("A");
    expect(getProfile("+91222").firstName).toBe("B");
  });

  it("returns null on corrupt storage", () => {
    localStorage.setItem("airme.profiles", "not-json");
    expect(getProfile("+91111")).toBeNull();
  });
});
