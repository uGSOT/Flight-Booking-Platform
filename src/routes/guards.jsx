import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/** Requires an authenticated user; otherwise redirect to home with intent to log in. */
export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location, login: true }} />;
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
