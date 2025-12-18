import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export default function PilotDashboardPage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName = localStorage.getItem("userName") || "Pilot";
  const pilotId = localStorage.getItem("pilotId");

  useEffect(() => {
    const loadFlights = async () => {
      if (!pilotId) {
        setError(
          "Bu kullanıcıya bağlı bir pilot profili bulunamadı. Lütfen admin ile görüşün."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${API_BASE}/api/flights/by-pilot/${pilotId}`
        );

        if (!res.data.success) {
          throw new Error(res.data.message || "API error");
        }

        setFlights(res.data.data || []);
      } catch (err) {
        console.error("Error loading pilot flights:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load your assigned flights."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, [pilotId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Welcome back, {userName}.
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Here are your assigned flights.
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
          You currently have no assigned flights.
        </p>
      )}

      {!loading && !error && flights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Upcoming assigned flights
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

              const origin =
                f.source?.airport_code ||
                f.source?.code ||
                f.source?.city ||
                "???";
              const dest =
                f.destination?.airport_code ||
                f.destination?.code ||
                f.destination?.city ||
                "???";

              const vehicleName = f.vehicle_type?.type_name || "N/A";

              return (
                <div
                  key={f.id}
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
                  <div className="text-xs text-slate-500">
                    Duration: {f.duration_minutes} min · Distance:{" "}
                    {Number(f.distance_km).toFixed(0)} km
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
