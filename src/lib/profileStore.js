// LocalStorage-backed profile store, keyed by phone. Stands in for Supabase
// `profiles` until the backend is wired.
const KEY = "airme.profiles";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function getProfile(phone) {
  return read()[phone] || null;
}

export function saveProfile(phone, profile) {
  const all = read();
  all[phone] = profile;
  localStorage.setItem(KEY, JSON.stringify(all));
  return profile;
}
