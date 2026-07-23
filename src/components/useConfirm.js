import { useState } from "react";

/** Drives a ConfirmDialog with an async action + busy state.
 *  confirm({ title, message, confirmLabel, danger, action }) opens it. */
export function useConfirm() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirm = (opts) => setState(opts);
  const close = () => (busy ? null : setState(null));
  const run = async () => {
    if (!state?.action) return;
    setBusy(true);
    try {
      await state.action();
      setState(null);
    } catch {
      // action already surfaces its own toast; keep the dialog open to retry
    } finally {
      setBusy(false);
    }
  };

  return { confirmState: state, busy, confirm, close, run };
}
