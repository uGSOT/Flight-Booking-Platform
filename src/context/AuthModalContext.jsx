import { createContext, useContext, useCallback, useMemo, useRef, useState } from "react";
import AuthModal from "../features/auth/AuthModal.jsx";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const onSuccessRef = useRef(null);

  const openLogin = useCallback((onSuccess) => {
    onSuccessRef.current = typeof onSuccess === "function" ? onSuccess : null;
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openLogin }), [openLogin]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => onSuccessRef.current?.()}
      />
    </AuthModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within <AuthModalProvider>");
  return ctx;
}
