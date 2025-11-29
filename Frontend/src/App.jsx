// App.jsx
import { Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import FlightSelectionPage from "./pages/Flights/FlightSelectionPage.jsx";
import CrewAssignmentPage from "./pages/Flights/CrewAssignmentPage.jsx";


export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/flights" element={<FlightSelectionPage />} />
        <Route path="/flights/:flightId/crew" element={<CrewAssignmentPage />} />
      </Routes>
    </AppLayout>
  );
}
