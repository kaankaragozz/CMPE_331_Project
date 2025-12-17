// src/pages/Flights/FlightDetailsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function formatDuration(minutes) {
  if (!minutes || Number.isNaN(minutes)) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function FlightDetailsPage() {
  const params = useParams();
  const flightNumberParam =
    params.flightNumber ||
    params.flightId ||
    params.id ||
    params.flight_number;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [flight, setFlight] = useState(null);
  const [crewAssignment, setCrewAssignment] = useState(null);
  const [passengers, setPassengers] = useState([]);

  const loadData = useCallback(async () => {
    if (!flightNumberParam) {
      console.error("FlightDetailsPage: no flight number in URL", params);
      setError("Flight number is missing in the URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Flight details (Flight-Service)
      const flightRes = await axios.get(
        `${API_BASE}/api/flights/${flightNumberParam}`
      );
      console.log("FlightDetailsPage: flightRes.data =", flightRes.data);

      let flightData =
        flightRes.data?.data || flightRes.data?.flight || flightRes.data;
      if (Array.isArray(flightData)) {
        flightData = flightData[0] || null;
      }
      setFlight(flightData);

      // 2) Crew assignment (may be 404 if none yet)
      try {
        const crewRes = await axios.get(
          `${API_BASE}/api/flights/${flightNumberParam}/crew-assignments`
        );
        console.log("FlightDetailsPage: crewRes.data =", crewRes.data);
        let crewData =
          crewRes.data?.data || crewRes.data?.assignment || crewRes.data;
        setCrewAssignment(crewData || null);
      } catch (err) {
        if (err.response?.status === 404) {
          console.log("No crew assignment yet for", flightNumberParam);
          setCrewAssignment(null);
        } else {
          console.error("Error loading crew assignment:", err);
        }
      }

      // 3) Passengers (Passenger-Service)
      try {
        const paxRes = await axios.get(
          `${API_BASE}/api/passengers/flight/${flightNumberParam}`
        );
        console.log("FlightDetailsPage: passengersRes.data =", paxRes.data);
        const paxData = paxRes.data?.data || paxRes.data || [];
        setPassengers(Array.isArray(paxData) ? paxData : []);
      } catch (err) {
        if (err.response?.status === 404) {
          console.log("No passengers found for flight", flightNumberParam);
          setPassengers([]);
        } else {
          console.error("Error loading passengers:", err);
        }
      }
    } catch (err) {
      console.error("Error loading flight details:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to load flight details. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [flightNumberParam, params]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Loading state
  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-slate-500">
          Loading flight details for{" "}
          <b>{flightNumberParam || "(unknown)"}</b>...
        </p>
      </div>
    );
  }

  // If no flight returned
  if (!flight) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">
            Flight Details
          </h2>
          <button
            type="button"
            onClick={() => navigate("/flights")}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back to flights
          </button>
        </div>
        <p className="text-sm text-red-600">
          Could not find flight{" "}
          <b>{flightNumberParam || "(unknown)"}</b>.
        </p>
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ================== FIELD MAPPING (no capacity) ==================
  const fn = flight.flight_number || flightNumberParam;

  const origin =
    flight.origin_airport ||
    flight.origin_airport_code ||
    flight.origin ||
    flight.departure_airport ||
    "";

  const destination =
    flight.destination_airport ||
    flight.destination_airport_code ||
    flight.destination ||
    flight.arrival_airport ||
    "";

  const routeText =
    origin && destination ? `${origin} → ${destination}` : flight.route || "";

  const departureTime =
    flight.departure_time ||
    flight.scheduled_departure ||
    flight.departure ||
    null;

  const arrivalTime =
    flight.arrival_time ||
    flight.scheduled_arrival ||
    flight.arrival ||
    null;

  // "Aircraft model" – the concrete vehicle type (e.g. Boeing 737-800)
  const aircraftModel =
    flight.vehicle_type_name ||
    flight.aircraft_model ||
    flight.aircraft_type ||
    flight.type_name ||
    (flight.vehicle_types && flight.vehicle_types.type_name) ||
    null;

  // "Plane type" – more generic category if you have it (narrow-body, wide-body, etc.)
  const planeType =
    flight.plane_type ||
    flight.plane_category ||
    flight.aircraft_category ||
    flight.aircraft_class ||
    null;

  const distanceKm =
    flight.distance_km ||
    flight.route_distance_km ||
    flight.distance ||
    null;

  const durationMinutes =
    flight.duration_minutes ||
    flight.duration_mins ||
    flight.flight_duration_minutes ||
    null;
  const durationText = formatDuration(
    durationMinutes || (typeof flight.duration === "number" ? flight.duration : null)
  );

  const rawStatus =
    flight.status ||
    (crewAssignment ? "Crew partially/fully assigned" : "Pending crew assignment") ||
    "Unknown";

  const status = String(rawStatus);

  const pilotCount = crewAssignment?.pilot_ids?.length || 0;
  const cabinCount = crewAssignment?.cabin_crew_ids?.length || 0;

  const totalPassengers = passengers.length;
  const passengersWithSeat = passengers.filter((p) => p.seat_number).length;
  const passengersWithoutSeat = totalPassengers - passengersWithSeat;

  // ================== RENDER ==================
  return (
    <div className="space-y-6">
      {/* Top header + navigation */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Flight Details
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Flight{" "}
            <span className="font-semibold text-slate-900">{fn}</span>{" "}
            {routeText && (
              <>
                • <span>{routeText}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate("/flights")}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back to flights
          </button>
          <button
            type="button"
            onClick={() => navigate(`/flights/${fn}/crew`)}
            className="inline-flex items-center rounded-md bg-slate-900 text-white px-3 py-2 text-xs sm:text-sm hover:bg-slate-800"
          >
            Manage crew →
          </button>
          <button
            type="button"
            onClick={() => navigate(`/flights/${fn}/passengers`)}
            className="inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-2 text-xs sm:text-sm hover:bg-indigo-700"
          >
            Manage seats →
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Flight summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Flight info
          </p>
          <p>
            <span className="font-medium text-slate-800">Flight:</span>{" "}
            {fn}
          </p>
          {routeText && (
            <p>
              <span className="font-medium text-slate-800">Route:</span>{" "}
              {routeText}
            </p>
          )}
          {aircraftModel && (
            <p>
              <span className="font-medium text-slate-800">
                Aircraft model:
              </span>{" "}
              {aircraftModel}
            </p>
          )}
          {planeType && (
            <p>
              <span className="font-medium text-slate-800">
                Plane type:
              </span>{" "}
              {planeType}
            </p>
          )}
          {distanceKm && (
            <p>
              <span className="font-medium text-slate-800">
                Distance:
              </span>{" "}
              {distanceKm} km
            </p>
          )}
          {durationText && (
            <p>
              <span className="font-medium text-slate-800">
                Duration:
              </span>{" "}
              {durationText}
            </p>
          )}
        </div>

        <div className="space-y-1 text-sm">
          {departureTime && (
            <p>
              <span className="font-medium text-slate-800">
                Departure:
              </span>{" "}
              {new Date(departureTime).toLocaleString()}
            </p>
          )}
          {arrivalTime && (
            <p>
              <span className="font-medium text-slate-800">
                Arrival:
              </span>{" "}
              {new Date(arrivalTime).toLocaleString()}
            </p>
          )}
          <p>
            <span className="font-medium text-slate-800">Status:</span>{" "}
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                status.toLowerCase().includes("ready")
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
              }`}
            >
              {status}
            </span>
          </p>
        </div>
      </section>

      {/* Crew / passenger cards (no capacity) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crew summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Crew assignment
          </p>
          {crewAssignment ? (
            <>
              <p className="text-sm text-slate-800">
                Pilots assigned:{" "}
                <span className="font-semibold">{pilotCount}</span>
              </p>
              <p className="text-sm text-slate-800">
                Cabin crew assigned:{" "}
                <span className="font-semibold">{cabinCount}</span>
              </p>
              <button
                type="button"
                onClick={() => navigate(`/flights/${fn}/crew`)}
                className="mt-3 inline-flex items-center rounded-md bg-slate-900 text-white px-3 py-1.5 text-xs hover:bg-slate-800"
              >
                Edit crew →
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-amber-700">
                No crew assignment saved yet for this flight.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/flights/${fn}/crew`)}
                className="mt-3 inline-flex items-center rounded-md bg-slate-900 text-white px-3 py-1.5 text-xs hover:bg-slate-800"
              >
                Assign crew now →
              </button>
            </>
          )}
        </div>

        {/* Passenger stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Passenger seats
          </p>
          <p className="text-sm text-slate-800">
            Total passengers:{" "}
            <span className="font-semibold">{totalPassengers}</span>
          </p>
          <p className="text-sm text-slate-800">
            With seat:{" "}
            <span className="font-semibold">{passengersWithSeat}</span>
          </p>
          <p className="text-sm text-slate-800">
            Without seat:{" "}
            <span className="font-semibold">{passengersWithoutSeat}</span>
          </p>
          <button
            type="button"
            onClick={() => navigate(`/flights/${fn}/passengers`)}
            className="mt-3 inline-flex items-center rounded-md bg-indigo-600 text-white px-3 py-1.5 text-xs hover:bg-indigo-700"
          >
            Manage seat assignments →
          </button>
        </div>
      </section>

      {/* Sample passenger list */}
      {passengers.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Sample passenger list
            </h3>
            <button
              type="button"
              onClick={() => navigate(`/flights/${fn}/passengers`)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Go to full seat assignment →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left font-semibold">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Nationality
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Seat
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Class
                  </th>
                </tr>
              </thead>
              <tbody>
                {passengers.slice(0, 8).map((p) => (
                  <tr
                    key={p.passenger_id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.nationality}</td>
                    <td className="px-3 py-2">
                      {p.seat_number || (
                        <span className="text-amber-700">No seat</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {p.seat_class || p.type_name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {passengers.length > 8 && (
              <p className="mt-2 text-xs text-slate-500">
                Showing first 8 passengers only.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
