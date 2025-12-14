// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState([]);
  const [upcomingFlights, setUpcomingFlights] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [flightsRes, pilotsRes, cabinRes] = await Promise.all([
          fetch(`${API_BASE_URL}/flight`),
          fetch(`${API_BASE_URL}/pilots`),
          fetch(`${API_BASE_URL}/cabin_crew`),
        ]);

        if (!flightsRes.ok)
          throw new Error(`Failed to load flights (${flightsRes.status})`);
        if (!pilotsRes.ok)
          throw new Error(`Failed to load pilots (${pilotsRes.status})`);
        if (!cabinRes.ok)
          throw new Error(`Failed to load cabin crew (${cabinRes.status})`);

        const flightsJson = await flightsRes.json();
        const pilotsJson = await pilotsRes.json();
        const cabinJson = await cabinRes.json();

        const flights = flightsJson.data || flightsJson || [];
        const pilots = pilotsJson.data || pilotsJson || [];
        const cabinCrew = cabinJson.data || cabinJson || [];

        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

        // Flights today
        const flightsToday = flights.filter((f) => {
          if (!f.flight_date) return false;
          const d = new Date(f.flight_date);
          const dStr = d.toISOString().slice(0, 10);
          return dStr === todayStr;
        });

        // Sort flights ascending by date
        const sortedFlights = [...flights].sort(
          (a, b) => new Date(a.flight_date) - new Date(b.flight_date)
        );

        // Next 5 upcoming flights (>= now)
        const upcomingRaw = sortedFlights
          .filter((f) => new Date(f.flight_date) >= now)
          .slice(0, 5);

        // For upcoming flights, load roster status
        const rosterStatuses = await Promise.all(
          upcomingRaw.map(async (f) => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/flight/${f.flight_number}/crew`
              );
              if (!res.ok) {
                return {
                  flight_number: f.flight_number,
                  pilotsAssigned: 0,
                  cabinAssigned: 0,
                };
              }
              const json = await res.json();
              const pilotsAssigned = json.data?.pilots?.length || 0;
              const cabinAssigned = json.data?.cabin_crew?.length || 0;
              return {
                flight_number: f.flight_number,
                pilotsAssigned,
                cabinAssigned,
              };
            } catch {
              return {
                flight_number: f.flight_number,
                pilotsAssigned: 0,
                cabinAssigned: 0,
              };
            }
          })
        );

        const todayLabel = (flightDate) => {
          const dStr = flightDate.toISOString().slice(0, 10);
          if (dStr === todayStr) return "Today";
          return flightDate.toLocaleDateString();
        };

        const upcoming = upcomingRaw.map((f) => {
          const flightDate = new Date(f.flight_date);
          const timePart = flightDate.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          });

          const statusInfo = rosterStatuses.find(
            (s) => s.flight_number === f.flight_number
          );

          let statusLabel = "Scheduled";
          if (statusInfo) {
            const hasPilots = statusInfo.pilotsAssigned > 0;
            const hasCabin = statusInfo.cabinAssigned > 0;
            if (hasPilots && hasCabin) statusLabel = "Roster ready";
            else if (!hasPilots && hasCabin) statusLabel = "Needs pilots";
            else if (hasPilots && !hasCabin) statusLabel = "Needs cabin crew";
            else statusLabel = "Needs crew assignment";
          }

          const route = `${f.source?.airport_code || f.source?.code || "??"} → ${
            f.destination?.airport_code || f.destination?.code || "??"
          }`;

          return {
            id: f.flight_number,
            flightNumber: f.flight_number,
            route,
            time: `${todayLabel(flightDate)} • ${timePart}`,
            aircraft: f.vehicle_type?.type_name || "Unknown",
            status: statusLabel,
          };
        });

        const rosterReadyCount = rosterStatuses.filter(
          (s) => s.pilotsAssigned > 0 && s.cabinAssigned > 0
        ).length;
        const pendingFlights = flights.length - rosterReadyCount;
        const crewAvailable = (pilots?.length || 0) + (cabinCrew?.length || 0);

        const newStats = [
          {
            label: "Flights today",
            value: flightsToday.length,
            sub: `${flights.length} total flights`,
          },
          {
            label: "Rosters generated",
            value: rosterReadyCount,
            sub: `${pendingFlights} pending`,
          },
          {
            label: "Pending flights",
            value: pendingFlights,
            sub: "need crew assignment",
          },
          {
            label: "Crew available",
            value: crewAvailable,
            sub: "pilots + cabin crew",
          },
        ];

        const newActivities = [
          `Loaded ${flights.length} flights from schedule.`,
          `${rosterReadyCount} flights currently have completed rosters.`,
          `${pendingFlights} flights missing full crew assignment.`,
          `${pilots.length} pilots and ${cabinCrew.length} cabin crew available in pool.`,
        ];

        setStats(newStats);
        setUpcomingFlights(upcoming);
        setActivities(newActivities);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleGoToFlights = () => {
    navigate("/flights");
  };

  const handleGenerateRoster = () => {
    // for now just go to flights page where user can pick a flight
    navigate("/flights");
  };

  const handleOpenCrewAssignment = (flightNumber) => {
    navigate(`/flights/${flightNumber}/crew`);
  };

  return (
    <div className="space-y-6">
      {/* Top section: intro + quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Overview of flights, rosters and crew status for your airline.
          </p>
          {loading && (
            <p className="mt-2 text-xs text-slate-400">
              Loading live data from server...
            </p>
          )}
          {error && (
            <p className="mt-2 text-xs text-red-500">
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerateRoster}
            className="inline-flex items-center rounded-lg bg-slate-900 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 hover:bg-slate-800"
          >
            Generate new roster
          </button>
          <button
            onClick={handleGoToFlights}
            className="inline-flex items-center rounded-lg border border-slate-300 text-xs sm:text-sm px-3 sm:px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Go to flights
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(stats.length ? stats : [
          // fallback dummy while loading or on error
          { label: "Flights today", value: "-", sub: "Loading..." },
          { label: "Rosters generated", value: "-", sub: "Loading..." },
          { label: "Pending flights", value: "-", sub: "Loading..." },
          { label: "Crew available", value: "-", sub: "Loading..." },
        ]).map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-1"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {stat.value}
            </p>
            <p className="text-xs text-slate-500">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* Main content: upcoming flights + activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming flights */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Upcoming flights
            </h3>
            <button
              onClick={handleGoToFlights}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              View all
            </button>
          </div>

          {upcomingFlights.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              {loading
                ? "Loading upcoming flights..."
                : "No upcoming flights found."}
            </p>
          ) : (
            <table className="w-full text-xs sm:text-sm">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="py-2">Flight</th>
                  <th className="py-2">Route</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">Aircraft</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingFlights.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b last:border-0 border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleOpenCrewAssignment(f.flightNumber)}
                  >
                    <td className="py-2 font-medium text-slate-900">
                      {f.id}
                    </td>
                    <td className="py-2 text-slate-700">{f.route}</td>
                    <td className="py-2 text-slate-600">{f.time}</td>
                    <td className="py-2 text-slate-600">{f.aircraft}</td>
                    <td className="py-2 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          f.status === "Roster ready"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Activity panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Recent activity
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 flex-1">
            {(activities.length ? activities : [
              "Loading activities..."
            ]).map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-4 text-xs text-slate-500 hover:text-slate-800 self-start">
            View full log
          </button>
        </div>
      </section>
    </div>
  );
}
