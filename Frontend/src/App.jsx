// App.jsx
import { Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import FlightSelectionPage from "./pages/Flights/FlightSelectionPage.jsx";
import CrewAssignmentPage from "./pages/Flights/CrewAssignmentPage.jsx";
import SeatAssignmentPage from "./pages/Passengers/SeatAssignmentPage.jsx";
import PlaneSeatMapPage from "./pages/Roster/PlaneSeatMapPage.jsx";
import RosterTabularPage from "./pages/Roster/RosterTabularPage.jsx";
import UserProfilePage from "./pages/User/UserProfilePage.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";

export default function App() {
  // KEEP IT TRUE UNTIL REPLACING IT WITH REAL AUTH
  const isAuthenticated = true; // later: replace with real auth

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/flights" element={<FlightSelectionPage />} />
        <Route path="/flights/:flightId/crew" element={<CrewAssignmentPage />} />
        <Route path="/flights/:flightId/passengers" element={<SeatAssignmentPage />} />
        <Route path="/roster/:flightId/plane" element={<PlaneSeatMapPage />} />
        <Route path="/roster/:flightId/tabular" element={<RosterTabularPage />} />
        <Route path="/user/profile" element={<UserProfilePage />} />
      </Routes>
    </AppLayout>
  );
}
