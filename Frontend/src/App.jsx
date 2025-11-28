import { Routes, Route, Link } from "react-router-dom";
import FlightSearchPage from "./pages/Flights/FlightSearchPage";

function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <p className="mb-4">This is the home page.</p>
      <Link to="/flights" className="text-blue-600 underline">
        Go to Flights
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/flights" element={<FlightSearchPage />} />
    </Routes>
  );
}
