// src/pages/Roster/RosterTabularPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api";

export default function RosterTabularPage() {
  const params = useParams();
  const navigate = useNavigate();

  // support different param names just in case
  const flightNumber =
    params.flightNumber || params.id || params.flightId || "";

  const [flightInfo, setFlightInfo] = useState(null);
  const [roster, setRoster] = useState([]);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name"); // name | type | seatNo | nationality

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // --- load data from backend ---
  useEffect(() => {
    const fetchData = async () => {
      if (!flightNumber) {
        setError("No flight number in URL. Check your route definition.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSaveMessage("");

        // 1) flight summary
        const flightRes = await fetch(
          `${API_BASE_URL}/flight/${flightNumber}`
        );
        if (!flightRes.ok) {
          const text = await flightRes.text();
          throw new Error(
            `Failed to load flight (${flightRes.status}): ${text}`
          );
        }
        const flightJson = await flightRes.json();
        const flight = flightJson.data || flightJson;
        setFlightInfo(flight);

        // 2) crew assignments (pilots + cabin crew)
        let pilots = [];
        let cabinCrew = [];
        try {
          const crewRes = await fetch(
            `${API_BASE_URL}/flight/${flightNumber}/crew`
          );
          if (crewRes.ok) {
            const crewJson = await crewRes.json();
            const payload = crewJson.data || crewJson;

            pilots =
              payload.pilots ||
              payload.flightCrew ||
              payload.pilotAssignments ||
              [];
            cabinCrew =
              payload.cabinCrew ||
              payload.cabin_crew ||
              payload.cabinCrewAssignments ||
              [];
          } else if (crewRes.status !== 404) {
            // 404 might just mean not implemented yet
            console.warn(
              "Crew endpoint not OK:",
              crewRes.status,
              await crewRes.text()
            );
          }
        } catch (e) {
          console.warn("Error fetching crew:", e);
        }

        // 3) passengers for this flight
        let passengers = [];
        try {
          const paxRes = await fetch(
            `${API_BASE_URL}/passengers/flight/${flightNumber}`
          );
          if (paxRes.ok) {
            const paxJson = await paxRes.json();
            passengers = paxJson.data || paxJson || [];
          } else if (paxRes.status !== 404) {
            const text = await paxRes.text();
            console.warn(
              "Passengers endpoint not OK:",
              paxRes.status,
              text
            );
          }
        } catch (e) {
          console.warn("Error fetching passengers:", e);
        }

        // 4) build combined roster
        const combinedRoster = buildCombinedRoster(
          flightNumber,
          pilots,
          cabinCrew,
          passengers
        );

        setRoster(combinedRoster);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load roster data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightNumber]);

  // --- search & sort on combined roster ---
  const filteredAndSortedRoster = useMemo(() => {
    const lower = search.trim().toLowerCase();

    let data = roster.filter((item) => {
      if (!lower) return true;
      return (
        item.type.toLowerCase().includes(lower) ||
        item.name.toLowerCase().includes(lower) ||
        item.id.toLowerCase().includes(lower) ||
        (item.seatNo || "").toLowerCase().includes(lower) ||
        (item.nationality || "").toLowerCase().includes(lower) ||
        (item.role || "").toLowerCase().includes(lower)
      );
    });

    data = [...data].sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });

    return data;
  }, [search, sortKey, roster]);

  const handleExportJSON = () => {
    const blob = new Blob(
      [JSON.stringify(filteredAndSortedRoster, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `roster-${flightNumber || "flight"}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveToDatabase = async () => {
    if (!flightNumber) return;
    setSaveMessage("");
    setError("");

    try {
      // this assumes you will implement this endpoint on backend
      const res = await fetch(
        `${API_BASE_URL}/flight/${flightNumber}/roster`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flight_number: flightNumber,
            roster: filteredAndSortedRoster,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to save roster (${res.status}): ${text}`
        );
      }

      setSaveMessage("Roster saved to database successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Failed to save roster to database. Endpoint may not be implemented yet."
      );
    }
  };

  const handleBackToFlights = () => {
    navigate("/flights");
  };

  const headerTitle = flightInfo
    ? `Combined Roster – Flight ${flightInfo.flight_number || flightNumber}`
    : "Combined Roster";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {headerTitle}
          </h2>
          {flightInfo && (
            <p className="text-sm text-slate-500 mt-1">
              {flightInfo.source?.airport_code || flightInfo.source?.code || "??"}{" "}
              →{" "}
              {flightInfo.destination?.airport_code ||
                flightInfo.destination?.code ||
                "??"}{" "}
              •{" "}
              {flightInfo.vehicle_type?.type_name || "Unknown aircraft"}{" "}
              •{" "}
              {flightInfo.flight_date
                ? new Date(flightInfo.flight_date).toLocaleString()
                : "Unknown date"}
            </p>
          )}
          {loading && (
            <p className="text-xs text-slate-400 mt-1">
              Loading roster data...
            </p>
          )}
          {error && (
            <p className="text-xs text-red-500 mt-1">
              {error}
            </p>
          )}
          {saveMessage && (
            <p className="text-xs text-emerald-600 mt-1">
              {saveMessage}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleBackToFlights}
          className="inline-flex items-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Flights
        </button>
      </div>

      {/* Search + sort + buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search by name, type, ID, seat, nationality..."
            className="w-full sm:max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="relative inline-block sm:w-48">
            <select
              className="w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              <option value="name">Sort by: Name</option>
              <option value="type">Sort by: Type</option>
              <option value="seatNo">Sort by: Seat No.</option>
              <option value="nationality">Sort by: Nationality</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs">
              ▼
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-70"
            disabled={roster.length === 0}
          >
            Export as JSON
          </button>
          <button
            type="button"
            onClick={handleSaveToDatabase}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-70"
            disabled={roster.length === 0}
          >
            Save to Database
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Seat No.
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  Nationality
                </th>
                <th className="px-4 py-2 text-left font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRoster.map((item, idx) => (
                <tr
                  key={item.id + idx}
                  className="border-t border-slate-200"
                >
                  <td className="px-4 py-2">{item.type}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.seatNo}</td>
                  <td className="px-4 py-2">{item.nationality}</td>
                  <td className="px-4 py-2">{item.role}</td>
                </tr>
              ))}

              {!loading && filteredAndSortedRoster.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-3 text-center text-slate-500"
                    colSpan={6}
                  >
                    No roster entries found for this flight.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// helper: build combined roster array from backend data
function buildCombinedRoster(flightNumber, pilots, cabinCrew, passengers) {
  const items = [];

  // Pilots
  (pilots || []).forEach((p, index) => {
    const id = p.pilot_id ?? p.id ?? `pilot-${index}`;
    const seatNo =
      p.seat_number || p.seat || "Cockpit";
    const nationality = p.nationality || "";
    const seniority = p.seniority_level || p.rank || "";

    items.push({
      type: "Pilot",
      name: p.name || p.full_name || `Pilot ${index + 1}`,
      id: String(id),
      seatNo,
      nationality,
      role: seniority
        ? capitalizeFirst(seniority)
        : "Pilot",
    });
  });

  // Cabin crew
  (cabinCrew || []).forEach((c, index) => {
    const id = c.attendant_id ?? c.id ?? `cabin-${index}`;
    const seatNo = c.seat_number || c.seat || "";
    const nationality = c.nationality || "";
    const role =
      c.attendant_type || c.role || "Cabin Crew";

    items.push({
      type: "Cabin Crew",
      name: c.name || `Cabin Crew ${index + 1}`,
      id: String(id),
      seatNo,
      nationality,
      role: capitalizeFirst(role),
    });
  });

  // Passengers
  (passengers || []).forEach((p, index) => {
    const id = p.passenger_id ?? p.id ?? `passenger-${index}`;
    const seatNo =
      p.seat_number || p.seat || "Unassigned";
    const nationality = p.nationality || "";
    const seatClass = p.seat_class || p.class || "";
    const isInfant = p.is_infant || false;

    items.push({
      type: "Passenger",
      name: p.name || `Passenger ${index + 1}`,
      id: String(id),
      seatNo,
      nationality,
      role: isInfant
        ? "Infant"
        : seatClass
        ? seatClass
        : "N/A",
    });
  });

  return items;
}

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}