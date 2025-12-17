// src/pages/Flights/FlightSelectionPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

// Helper: format DB timestamp to "YYYY/MM/DD HH:MM"
function formatFlightDateTime(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

// Helper: check if flight_date matches the filter date (YYYY-MM-DD from input)
function matchesDateFilter(flightDate, filterDate) {
  if (!filterDate) return true;
  if (!flightDate) return false;

  const d = new Date(flightDate);
  if (Number.isNaN(d.getTime())) return true;

  const isoDate = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
  return isoDate === filterDate;
}

export default function FlightSelectionPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    flightNumber: "",
    origin: "",
    destination: "",
    date: "",
    vehicleType: "",
  });

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch flights from backend on mount
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/flights`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch flights (${res.status}): ${text}`);
        }

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || "Unknown error from flight API");
        }

        setFlights(json.data || []);
      } catch (err) {
        console.error("Error loading flights:", err);
        setError(err.message || "Failed to load flights");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const handleChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      const fn = filters.flightNumber.trim().toLowerCase();
      const origin = filters.origin.trim().toLowerCase();
      const dest = filters.destination.trim().toLowerCase();
      const veh = filters.vehicleType.trim().toLowerCase();
      const date = filters.date; // YYYY-MM-DD

      const flightNumber = (f.flight_number || "").toLowerCase();

      const originCode = (f.source?.airport_code || "").toLowerCase();
      const originCity = (f.source?.city || "").toLowerCase();

      const destCode = (f.destination?.airport_code || "").toLowerCase();
      const destCity = (f.destination?.city || "").toLowerCase();

      const vehicleName = (f.vehicle_type?.type_name || "").toLowerCase();

      if (fn && !flightNumber.includes(fn)) return false;

      if (
        origin &&
        !(
          originCode.includes(origin) ||
          originCity.includes(origin)
        )
      ) {
        return false;
      }

      if (
        dest &&
        !(
          destCode.includes(dest) ||
          destCity.includes(dest)
        )
      ) {
        return false;
      }

      if (veh && !vehicleName.includes(veh)) return false;

      if (!matchesDateFilter(f.flight_date, date)) return false;

      return true;
    });
  }, [filters, flights]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Filtering is live; no extra action needed now.
  };

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h2 className="text-2xl font-semibold text-slate-900">
        Flight Selection
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
              placeholder="Code or city (e.g. IST)"
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
              placeholder="Code or city (e.g. FRA)"
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
              placeholder="e.g., Boeing 737"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.vehicleType}
              onChange={handleChange("vehicleType")}
            />
          </div>
        </div>
      </form>

      {/* Available flights */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Available Flights
          </h3>
          {loading && (
            <p className="text-xs text-slate-500">Loading flights…</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {!loading &&
            filteredFlights.map((flight) => {
              const routeLabel = `${flight.source?.airport_code || "??"} → ${
                flight.destination?.airport_code || "??"
              }`;
              const dateTimeLabel = formatFlightDateTime(
                flight.flight_date
              );
              const vehicleName =
                flight.vehicle_type?.type_name || "N/A";

              return (
                <div
                  key={flight.id || flight.flight_number}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col justify-between"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        {flight.flight_number}
                      </div>
                      <p className="text-xs text-slate-500">
                        {routeLabel}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-medium">Date/Time:</span>{" "}
                      {dateTimeLabel}
                    </p>
                    <p>
                      <span className="font-medium">Origin:</span>{" "}
                      {flight.source?.city} (
                      {flight.source?.airport_code})
                    </p>
                    <p>
                      <span className="font-medium">
                        Destination:
                      </span>{" "}
                      {flight.destination?.city} (
                      {flight.destination?.airport_code})
                    </p>
                    <p>
                      <span className="font-medium">Aircraft:</span>{" "}
                      {vehicleName}
                    </p>
                  </div>

                  {/* Navigation buttons to other pages */}
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/flights/${flight.flight_number}`)
                        }
                        className="flex-1 rounded-md bg-slate-800 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-900"
                      >
                        Flight Details
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/flights/${flight.flight_number}/crew`
                          )
                        }
                        className="flex-1 rounded-md bg-emerald-500 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-emerald-600"
                      >
                        Crew Assignment
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/flights/${flight.flight_number}/passengers`
                          )
                        }
                        className="flex-1 rounded-md bg-blue-500 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-600"
                      >
                        Passengers & Seats
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/flights/${flight.flight_number}/plane`
                          )
                        }
                        className="flex-1 rounded-md bg-indigo-500 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-indigo-600"
                      >
                        Seat Map
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/roster/${flight.flight_number}/roster`
                        )
                      }
                      className="w-full rounded-md bg-slate-100 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 hover:bg-slate-200"
                    >
                      Combined Roster (Tabular)
                    </button>
                  </div>
                </div>
              );
            })}

          {!loading && !error && filteredFlights.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full">
              No flights match the selected filters.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
