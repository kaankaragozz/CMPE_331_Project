// src/pages/DashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [flights, setFlights] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [cabinCrew, setCabinCrew] = useState([]);

  // flightNumber -> assignment object (or null if no assignment)
  const [assignmentIndex, setAssignmentIndex] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) Load flights, pilots, cabin crew in parallel
        const [flightsRes, pilotsRes, cabinCrewRes] = await Promise.all([
          axios.get(`${API_BASE}/api/flights`),
          axios.get(`${API_BASE}/api/pilots`),
          axios.get(`${API_BASE}/api/cabin-crew`),
        ]);

        const flightList = flightsRes.data?.data || [];
        const pilotList = pilotsRes.data?.data || [];
        const cabinList = cabinCrewRes.data?.data || [];

        setFlights(flightList);
        setPilots(pilotList);
        setCabinCrew(cabinList);

        // 2) For each flight, try to load its crew assignment
        const assignmentPairs = await Promise.all(
          flightList.map(async (f) => {
            const flightNumber = f.flight_number;
            if (!flightNumber) return [null, null];

            try {
              const res = await axios.get(
                `${API_BASE}/api/flights/${flightNumber}/crew-assignments`
              );
              const assignment = res.data?.data || res.data;
              return [flightNumber, assignment];
            } catch (err) {
              // 404 = no assignment yet -> that's fine
              if (err.response && err.response.status === 404) {
                return [flightNumber, null];
              }
              console.error(
                "Error fetching assignment for",
                flightNumber,
                err
              );
              return [flightNumber, null];
            }
          })
        );

        const idx = {};
        assignmentPairs.forEach(([fn, a]) => {
          if (fn) idx[fn] = a;
        });
        setAssignmentIndex(idx);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const now = useMemo(() => new Date(), []);

  // -------- STATS FROM DB --------
  const stats = useMemo(() => {
    const flightsToday = flights.filter((f) => {
      if (!f.flight_date) return false;
      const d = new Date(f.flight_date);
      return isSameDay(d, now);
    });

    let rostersGenerated = 0;
    flightsToday.forEach((f) => {
      const a = assignmentIndex[f.flight_number];
      const pilotsCount = Array.isArray(a?.pilot_ids) ? a.pilot_ids.length : 0;
      const cabinCount = Array.isArray(a?.cabin_crew_ids)
        ? a.cabin_crew_ids.length
        : 0;

      if (pilotsCount > 0 && cabinCount > 0) {
        rostersGenerated += 1;
      }
    });

    const pendingFlights = Math.max(flightsToday.length - rostersGenerated, 0);
    const crewAvailable = pilots.length + cabinCrew.length;

    return [
      {
        label: "Flights today",
        value: flightsToday.length,
        sub: "",
      },
      {
        label: "Rosters generated",
        value: rostersGenerated,
        sub:
          pendingFlights > 0
            ? `${pendingFlights} pending`
            : flightsToday.length > 0
            ? "All covered"
            : "No flights today",
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
  }, [flights, pilots, cabinCrew, assignmentIndex, now]);

  // -------- UPCOMING FLIGHTS TABLE --------
  const upcomingFlights = useMemo(() => {
    if (!flights.length) return [];

    const sorted = flights
      .filter((f) => f.flight_date)
      .map((f) => ({ ...f, _date: new Date(f.flight_date) }))
      .sort((a, b) => a._date - b._date)
      .slice(0, 6); // show first 6 upcoming

    return sorted.map((f) => {
      const dt = f._date;
      const isTodayFlag = isSameDay(dt, now);

      const timeStr = dt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateStr = dt.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
      });

      const assignment = assignmentIndex[f.flight_number];
      const pilotsCount = Array.isArray(assignment?.pilot_ids)
        ? assignment.pilot_ids.length
        : 0;
      const cabinCount = Array.isArray(assignment?.cabin_crew_ids)
        ? assignment.cabin_crew_ids.length
        : 0;

      let status = "Needs crew assignment";
      if (assignment) {
        if (pilotsCount > 0 && cabinCount > 0) status = "Roster ready";
        else if (pilotsCount === 0 && cabinCount > 0) status = "Needs pilots";
        else if (pilotsCount > 0 && cabinCount === 0)
          status = "Needs cabin crew";
      }

      const origin =
        f.source?.airport_code || f.source?.code || f.source?.city || "???";
      const dest =
        f.destination?.airport_code ||
        f.destination?.code ||
        f.destination?.city ||
        "???";

      return {
        id: f.flight_number,
        route: `${origin} → ${dest}`,
        time: `${isTodayFlag ? "Today" : dateStr} • ${timeStr}`,
        aircraft: f.vehicle_type?.type_name || "N/A",
        status,
      };
    });
  }, [flights, assignmentIndex, now]);

  const activities = [
    "Roster generated for a recent flight",
    "Cabin crew updated",
    "Passenger seats auto-assigned",
    "New crew member added to pool",
  ];

  // -------- RENDER --------

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-slate-500">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

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
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center rounded-lg bg-slate-900 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 hover:bg-slate-800"
            onClick={() => navigate("/flights")}
          >
            Go to flights
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
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
            {stat.sub && (
              <p className="text-xs text-slate-500">{stat.sub}</p>
            )}
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
              className="text-xs text-slate-500 hover:text-slate-800"
              onClick={() => navigate("/flights")}
            >
              View all
            </button>
          </div>

          {upcomingFlights.length === 0 ? (
            <p className="text-xs text-slate-500">
              No upcoming flights found.
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
                    onClick={() =>
                      navigate(`/flights/${f.id}/crew`)
                    }
                  >
                    <td className="py-2 font-medium text-slate-900">
                      {f.id}
                    </td>
                    <td className="py-2 text-slate-700">{f.route}</td>
                    <td className="py-2 text-slate-600">{f.time}</td>
                    <td className="py-2 text-slate-600">
                      {f.aircraft}
                    </td>
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
            {activities.map((item, idx) => (
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
