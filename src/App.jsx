import { Routes, Route } from "react-router-dom";
import SiteLayout from "./components/SiteLayout.jsx";
import BookingShell from "./components/BookingShell.jsx";
import Placeholder from "./components/Placeholder.jsx";
import LandingPage from "./features/landing/LandingPage.jsx";
import SearchResults from "./features/results/SearchResults.jsx";
import ReviewDetails from "./features/booking/ReviewDetails.jsx";
import AddOns from "./features/booking/AddOns.jsx";
import Payment from "./features/booking/Payment.jsx";
import Confirmation from "./features/booking/Confirmation.jsx";
import Profile from "./features/profile/Profile.jsx";
import MyBookings from "./features/bookings/MyBookings.jsx";
import DashboardLayout from "./features/dashboard/DashboardLayout.jsx";
import DashboardOverview from "./features/dashboard/DashboardOverview.jsx";
import DashboardReports from "./features/dashboard/DashboardReports.jsx";
import AdminLayout from "./features/admin/AdminLayout.jsx";
import AdminOverview from "./features/admin/AdminOverview.jsx";
import AdminBookings from "./features/admin/AdminBookings.jsx";
import AdminUsers from "./features/admin/AdminUsers.jsx";
import AdminReports from "./features/admin/AdminReports.jsx";
import AccessDenied from "./features/admin/AccessDenied.jsx";
import { RequireAuth, RequireAdmin } from "./routes/guards.jsx";

export default function App() {
  return (
    <Routes>
      {/* Marketing + authenticated dashboard site */}
      <Route element={<SiteLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
        <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route index element={<DashboardOverview />} />
          <Route path="reports" element={<DashboardReports />} />
        </Route>
      </Route>

      {/* Booking flow shell (4-step stepper header) */}
      <Route element={<BookingShell />}>
        {/* Step 1 — Flight Selection */}
        <Route path="flights" element={<SearchResults />} />
        {/* Step 2 — Review & Traveller Details */}
        <Route path="booking/review" element={<ReviewDetails />} />
        {/* Step 3 — Add-ons */}
        <Route path="booking/addons" element={<AddOns />} />
        {/* Step 4 — Payment + Confirmation */}
        <Route path="booking/payment" element={<Payment />} />
        <Route path="booking/confirmation/:ref" element={<Confirmation />} />
      </Route>

      {/* Admin shell (role-gated) */}
      <Route path="admin/denied" element={<AccessDenied />} />
      <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<AdminOverview />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<Placeholder title="Page not found" note="The page you’re looking for doesn’t exist." />} />
    </Routes>
  );
}
