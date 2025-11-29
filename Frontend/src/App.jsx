// App.jsx
import { Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import FlightSelectionPage from "./pages/Flights/FlightSelectionPage.jsx";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/flights" element={<FlightSelectionPage />} />
      </Routes>
    </AppLayout>
  );
}
