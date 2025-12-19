// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";

// Pages
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import PilotDashboardPage from "./pages/Dashboard/PilotDashboardPage.jsx";

import CabinCrewDashboardPage from "./pages/Dashboard/CabinCrewDashBoardPage.jsx";


import FlightSelectionPage from "./pages/Flights/FlightSelectionPage.jsx";
import FlightDetailsPage from "./pages/Flights/FlightDetailsPage.jsx";
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
              <Route path="/pilot" element={<PilotDashboardPage />} />
            )}

            {role === "CabinCrew" && (
              <Route path="/cabincrew" element={<CabinCrewDashboardPage />} />
            )}

            {role === "Passenger" && (
              <Route path="/passenger" element={<SeatAssignmentPage />} />
            )}

            {/* COMMON ROUTES */}
            <Route index element={<DashboardPage />} />
            <Route path="/flights" element={<FlightSelectionPage />} />
            <Route
              path="/flights/:flightNumber/crew"
              element={<CrewAssignmentPage />}
            />
            <Route
              path="/flights/:flightNumber/passengers"
              element={<SeatAssignmentPage />}
            />
            <Route
              path="/flights/:flightNumber"
              element={<FlightDetailsPage />}
            />
            <Route
              path="/flights/:flightNumber/plane"
              element={<PlaneSeatMapPage />}
            />
            <Route
              path="/roster/:flightNumber/roster"
              element={<RosterTabularPage />}
            />
            <Route path="/user/profile" element={<UserProfilePage />} />
          </>
        )}
      </Routes>
    </AppLayout>
  );
}
