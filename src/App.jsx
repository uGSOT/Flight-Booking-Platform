import { Routes, Route } from "react-router-dom";
import SiteLayout from "./components/SiteLayout.jsx";
import BookingShell from "./components/BookingShell.jsx";
import Placeholder from "./components/Placeholder.jsx";
import LandingPage from "./features/landing/LandingPage.jsx";
import SearchResults from "./features/results/SearchResults.jsx";
import ReviewDetails from "./features/booking/ReviewDetails.jsx";
import { RequireAuth, RequireAdmin } from "./routes/guards.jsx";

export default function App() {
  return (
    <Routes>
      {/* Marketing + authenticated dashboard site */}
      <Route element={<SiteLayout />}>
        <Route index element={<LandingPage />} />
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

      {/* Booking flow shell (4-step stepper header) */}
      <Route element={<BookingShell />}>
        {/* Step 1 — Flight Selection */}
        <Route path="flights" element={<SearchResults />} />
        {/* Step 2 — Review & Traveller Details */}
        <Route path="booking/review" element={<ReviewDetails />} />
        {/* Steps 3–4 (login gating to be added with the auth modal) */}
        <Route path="booking/addons" element={<Placeholder title="Add-ons" note="Step 3 — seat map + meals — next." />} />
        <Route path="booking/payment" element={<Placeholder title="Payment" note="Step 4 — Razorpay — next." />} />
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
