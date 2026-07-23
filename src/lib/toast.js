// Tiny pub/sub toast store. Usable from anywhere (components, React Query
// callbacks, plain async code) — the <Toaster /> subscribes and renders.
let seq = 0;
let toasts = [];
const listeners = new Set();

function emit() {
  for (const l of listeners) l(toasts);
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(type, message, opts = {}) {
  const id = ++seq;
  const duration = opts.duration ?? (type === "error" ? 6000 : 4000);
  toasts = [...toasts, { id, type, message }];
  emit();
  if (duration) setTimeout(() => dismissToast(id), duration);
  return id;
}

export function subscribeToasts(fn) {
  listeners.add(fn);
  fn(toasts);
  return () => listeners.delete(fn);
}

export const toast = {
  success: (m, o) => push("success", m, o),
  error: (m, o) => push("error", m, o),
  info: (m, o) => push("info", m, o),
  warning: (m, o) => push("warning", m, o),
};
