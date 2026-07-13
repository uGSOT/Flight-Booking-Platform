import { Routes, Route } from "react-router-dom";
import SiteLayout from "./components/SiteLayout.jsx";
import Placeholder from "./components/Placeholder.jsx";
import LandingPage from "./features/landing/LandingPage.jsx";
import { RequireAuth, RequireAdmin } from "./routes/guards.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<SiteLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="flights" element={<Placeholder title="Search Results" note="Filters, sort and flight result cards — M1." />} />

        {/* Booking flow (auth required to complete) */}
        <Route
          path="booking/*"
          element={
            <RequireAuth>
              <Placeholder title="Booking" note="4-step flow: Flight Selection → Review & Traveller → Add-ons → Payment — M1." />
            </RequireAuth>
          }
        />

        {/* Authenticated traveller */}
        <Route
          path="bookings"
          element={
            <RequireAuth>
              <Placeholder title="My Bookings" note="List, detail drawer and cancel — M2." />
            </RequireAuth>
          }
        />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <Placeholder title="Profile" note="Personal, contact and GSTIN details — M2." />
            </RequireAuth>
          }
        />
        <Route
          path="dashboard/*"
          element={
            <RequireAuth>
              <Placeholder title="Dashboard" note="Overview + reports — M3." />
            </RequireAuth>
          }
        />
      </Route>

      {/* Admin shell (role-gated) */}
      <Route path="admin/denied" element={<Placeholder title="Access denied" note="You don’t have permission to view this page." />} />
      <Route
        path="admin/*"
        element={
          <RequireAdmin>
            <Placeholder title="Admin" note="Overview, all bookings, users and reports — M4." />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<Placeholder title="Page not found" note="The page you’re looking for doesn’t exist." />} />
    </Routes>
  );
}
