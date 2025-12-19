import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export default function PassengerDashboardPage() {
  const userName = localStorage.getItem("userName") || "Passenger";
  const passengerId = localStorage.getItem("passengerId");

  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState({});
  const [vehicleTypes, setVehicleTypes] = useState({});
  const [seatTypes, setSeatTypes] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!passengerId) {
      setError("Passenger profile not found.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [airportsRes, vehicleRes, flightsRes, seatTypesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/airports`),
          axios.get(`${API_BASE}/api/vehicle-types`),
          axios.get(`${API_BASE}/api/passengers/${passengerId}/flight`),
          axios.get(`${API_BASE}/api/passengers/seat-types`)
        ]);

        // Airports map: { id: code }
        const airportMap = {};
        airportsRes.data.data.forEach(a => {
          airportMap[a.id] = a.code;
        });

        // Vehicle types map: { id: type_name }
        const vehicleMap = {};
        vehicleRes.data.data.forEach(v => {
          vehicleMap[v.id] = v.type_name;
        });

        // Seat types: { id -> name }
        const seatTypeMap = {};
        seatTypesRes.data.data.forEach(s => {
          seatTypeMap[s.seat_type_id] = s.type_name;
        });


        setAirports(airportMap);
        setVehicleTypes(vehicleMap);
        setSeatTypes(seatTypeMap);
        setFlights(flightsRes.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load your booked flights.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [passengerId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Welcome back, {userName}.
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Here are your booked flights.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-500">Loading your flights…</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && flights.length === 0 && (
        <p className="text-sm text-slate-500">
          You currently have no booked flights.
        </p>
      )}

      {!loading && !error && flights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Upcoming booked flights
          </h3>

          <div className="space-y-3">
            {flights.map((f) => {

              const d = f.flight_date ? new Date(f.flight_date) : null;
              const dateLabel = d
                ? d.toLocaleString([], {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "-";

              const origin = airports[f.source_airport_id] || "???";
              const dest = airports[f.destination_airport_id] || "???";
              const vehicleName = vehicleTypes[f.vehicle_type_id] || "N/A";

              return (
                <div
                  key={`${f.flight_number}-${f.seat_number}`}
                  className="border border-slate-200 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {f.flight_number} · {origin} → {dest}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dateLabel} · {vehicleName}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div>
                      Duration: {f.duration_minutes} min · Distance:{" "}
                      {Number(f.distance_km).toFixed(0)} km
                    </div>
                    <div className="text-xs text-slate-500">
                      Seat:
                      <span className="font-medium ml-1">
                        {f.seat_number}
                      </span>
                      <span className="ml-1">
                        · {seatTypes[f.seat_type_id] || "Unknown"}
                      </span>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
