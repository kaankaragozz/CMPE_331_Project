// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";

// Pages
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import FlightSelectionPage from "./pages/Flights/FlightSelectionPage.jsx";
import CrewAssignmentPage from "./pages/Flights/CrewAssignmentPage.jsx";
import SeatAssignmentPage from "./pages/Passengers/SeatAssignmentPage.jsx";
import PlaneSeatMapPage from "./pages/Roster/PlaneSeatMapPage.jsx";
import RosterTabularPage from "./pages/Roster/RosterTabularPage.jsx";
import UserProfilePage from "./pages/User/UserProfilePage.jsx";

// Auth
import LoginPage from "./pages/Auth/LoginPage.jsx";

export default function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const isAuthenticated = !!token;

  return (
    <AppLayout>
      <Routes>
        {/* LOGIN PAGE */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />
          }
        />

        {/* NOT LOGGED IN → ALWAYS GO TO /login */}
        {!isAuthenticated ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <>
            {/* ROLE-BASED ROUTES */}
            {role === "Admin" && (
              <Route path="/" element={<DashboardPage />} />
            )}

            {role === "Pilot" && (
              <Route path="/pilot" element={<PlaneSeatMapPage />} />
            )}

            {role === "CabinCrew" && (
              <Route path="/cabincrew" element={<FlightSelectionPage />} />
            )}

            {role === "Passenger" && (
              <Route path="/passenger" element={<SeatAssignmentPage />} />
            )}

            {/* COMMON ROUTES — FIXED USING index */}
            <Route index element={<DashboardPage />} />
            <Route path="/flights" element={<FlightSelectionPage />} />
            <Route
              path="/flights/:flightId/crew"
              element={<CrewAssignmentPage />}
            />
            <Route
              path="/flights/:flightId/passengers"
              element={<SeatAssignmentPage />}
            />
            <Route
              path="/roster/:flightId/plane"
              element={<PlaneSeatMapPage />}
            />
            <Route
              path="/roster/:flightId/tabular"
              element={<RosterTabularPage />}
            />
            <Route path="/user/profile" element={<UserProfilePage />} />
          </>
        )}
      </Routes>
    </AppLayout>
  );
}
