// src/pages/Flights/FlightSelectionPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api";

function formatFlightDate(isoString) {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export default function FlightSelectionPage() {
  const [filters, setFilters] = useState({
    flightNumber: "",
    origin: "",
    destination: "",
    date: "",
    vehicleType: "",
  });

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ---- Fetch all flights from backend on mount ----
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/flight`);
        if (!res.ok) {
          throw new Error(`Failed to fetch flights (${res.status})`);
        }
        const json = await res.json();
        // Your controller returns { success, count, data }
        setFlights(json.data || []);
      } catch (err) {
        console.error("Error loading flights:", err);
        setError(err.message || "Could not load flights.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const handleChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // ---- Client-side filtering using backend data ----
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      const fn = filters.flightNumber.trim().toLowerCase();
      const origin = filters.origin.trim().toLowerCase();
      const dest = filters.destination.trim().toLowerCase();
      const veh = filters.vehicleType.trim().toLowerCase();
      const date = filters.date.trim(); // yyyy-mm-dd

      const flightNumber = (f.flight_number || "").toLowerCase();
      const originCode =
        (f.source?.airport_code || f.source?.code || "").toLowerCase();
      const destCode =
        (f.destination?.airport_code || f.destination?.code || "").toLowerCase();
      const vehicleType = (f.vehicle_type?.type_name || "").toLowerCase();

      if (fn && !flightNumber.includes(fn)) return false;
      if (origin && !originCode.includes(origin)) return false;
      if (dest && !destCode.includes(dest)) return false;
      if (veh && !vehicleType.includes(veh)) return false;

      if (date) {
        // compare only the date part of flight_date
        const flightDate = f.flight_date
          ? new Date(f.flight_date).toISOString().slice(0, 10)
          : "";
        if (flightDate !== date) return false;
      }

      return true;
    });
  }, [filters, flights]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Right now we just use client-side filtering.
    // If you later add query params on backend, you can move fetching here.
  };

  // ---- Navigation handlers (optional but useful) ----
  const handleSelectFlight = (flight) => {
    // Go to crew assignment page for that flight
    navigate(`/flights/${flight.flight_number}/crew`);
  };

  const handleViewDetails = (flight) => {
    // Go to detailed flight info page (you can create this route later)
    navigate(`/flights/${flight.flight_number}`);
  };

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h2 className="text-2xl font-semibold text-slate-900">
        Flight Selection Page
      </h2>

      {/* Search + filters */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5"
      >
        {/* Top search bar */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Search by Flight Number (AANNNN)
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="e.g., AA1001"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.flightNumber}
              onChange={handleChange("flightNumber")}
            />
            <button
              type="submit"
              className="shrink-0 inline-flex items-center justify-center rounded-md bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </div>

        {/* Lower filter row */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Origin
            </label>
            <input
              type="text"
              placeholder="e.g., IST"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.origin}
              onChange={handleChange("origin")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Destination
            </label>
            <input
              type="text"
              placeholder="e.g., JFK"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.destination}
              onChange={handleChange("destination")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              type="date"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.date}
              onChange={handleChange("date")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Vehicle Type
            </label>
            <input
              type="text"
              placeholder="e.g., A320"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.vehicleType}
              onChange={handleChange("vehicleType")}
            />
          </div>
        </div>
      </form>

      {/* Error / loading states */}
      {loading && <p className="text-sm text-slate-500">Loading flights...</p>}
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Available flights */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-base font-semibold text-slate-900">
          Available Flights
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredFlights.map((flight) => {
            const flightNumber = flight.flight_number;
            const dateTime = formatFlightDate(flight.flight_date);

            const originCode =
              flight.source?.airport_code || flight.source?.code || "N/A";
            const destCode =
              flight.destination?.airport_code ||
              flight.destination?.code ||
              "N/A";

            const route = `${originCode} - ${destCode}`;

            const planeType = flight.vehicle_type?.type_name || "Unknown";

            return (
              <div
                key={flight.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col justify-between"
              >
                {/* Header: flight id + share icon */}
                <div className="flex items-start justify-between mb-3">
                  <div className="text-lg font-semibold text-slate-900">
                    {flightNumber}
                  </div>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Share"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <path d="M8.59 13.51 15.42 17.5" />
                      <path d="M15.41 6.5 8.59 10.49" />
                    </svg>
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-1 text-sm text-slate-700">
                  <p>
                    <span className="font-medium">Date/Time:</span>{" "}
                    {dateTime}
                  </p>
                  <p>
                    <span className="font-medium">Route:</span> {route}
                  </p>
                  <p>
                    <span className="font-medium">Plane Type:</span>{" "}
                    {planeType}
                  </p>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectFlight(flight)}
                    className="flex-1 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                  >
                    Select
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewDetails(flight)}
                    className="flex-1 rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && filteredFlights.length === 0 && !error && (
            <p className="text-sm text-slate-500 col-span-full">
              No flights match the selected filters.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
