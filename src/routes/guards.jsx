import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAuthModal } from "../context/AuthModalContext.jsx";

/** Requires an authenticated user; otherwise show a login prompt (opens the modal). */
export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { openLogin } = useAuthModal();
  if (loading) return null;
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ paddingBlock: "var(--space-16)", textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--fs-h2)", marginBottom: "var(--space-3)" }}>Please log in</h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
          Log in with your mobile number to view this page.
        </p>
        <button
          type="button"
          onClick={() => openLogin()}
          style={{
            background: "var(--color-primary)", color: "#fff", border: "none",
            borderRadius: "var(--radius-input)", padding: "var(--space-3) var(--space-8)",
            fontWeight: "var(--fw-semibold)", fontSize: "1rem",
          }}
        >
          Log In
        </button>
      </div>
    );
  }
  return children;
}

/** Requires an admin role; otherwise render Access Denied. */
export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/denied" replace />;
  }
  return children;
}
