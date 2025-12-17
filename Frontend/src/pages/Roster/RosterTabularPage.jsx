// src/pages/Roster/RosterTabularPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Static demo crew – real passengers come from DB
const STATIC_CREW_ROSTER = [
  {
    type: "Pilot",
    name: "John Doe",
    id: "P101",
    seatNo: "Cockpit",
    nationality: "American",
    role: "Captain",
  },
  {
    type: "Pilot",
    name: "Emily Brown",
    id: "P102",
    seatNo: "Cockpit",
    nationality: "French",
    role: "First Officer",
  },
  {
    type: "Cabin Crew",
    name: "Jane Smith",
    id: "CC201",
    seatNo: "A1",
    nationality: "British",
    role: "Flight Attendant",
  },
  {
    type: "Cabin Crew",
    name: "Michael Davis",
    id: "CC202",
    seatNo: "A2",
    nationality: "Australian",
    role: "Flight Attendant",
  },
];

export default function RosterTabularPage() {
  const { flightNumber } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbPassengers, setDbPassengers] = useState([]);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name"); // name | role | seatNo | nationality

  // Fetch passengers for this flight from Passenger-Service
  useEffect(() => {
    async function fetchRoster() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${API_BASE}/api/passengers/flight/${flightNumber}`
        );

        const passengers = res.data?.data || [];
        setDbPassengers(passengers);
      } catch (err) {
        console.error("Error loading roster data:", err);
        setError("Failed to load roster data from database.");
      } finally {
        setLoading(false);
      }
    }

    if (flightNumber) {
      fetchRoster();
    }
  }, [flightNumber]);

  // Map DB passengers into unified roster entries
  const combinedRoster = useMemo(() => {
    const passengerEntries = dbPassengers.map((p) => ({
      type: p.is_infant ? "Infant" : "Passenger",
      name: p.name,
      id: `PA${p.passenger_id}`,
      seatNo: p.seat_number || "-",
      nationality: p.nationality || "",
      role: p.is_infant
        ? "Infant"
        : p.seat_class || "Passenger", // e.g. Business / Economy / Passenger
    }));

    return [...STATIC_CREW_ROSTER, ...passengerEntries];
  }, [dbPassengers]);

  const filteredAndSortedRoster = useMemo(() => {
    const lower = search.trim().toLowerCase();

    let data = combinedRoster.filter((item) => {
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
  }, [combinedRoster, search, sortKey]);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredAndSortedRoster, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `roster_${flightNumber || "flight"}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // This page is read-only – data is already in DB from seat / crew assignment pages.
  const handleSaveToDatabase = () => {
    alert(
      "This roster is derived from live database data (crew + passengers). There are no editable changes to save from this page."
    );
  };

  const handleGoBackToFlightDetails = () => {
    navigate(`/flights/${flightNumber}/details`);
  };

  const handleGoToCrewAssignment = () => {
    navigate(`/flights/${flightNumber}/crew`);
  };

  const handleGoToSeatAssignment = () => {
    navigate(`/flights/${flightNumber}/passenger-seats`);
  };

  const handleGoToSeatMap = () => {
    navigate(`/flights/${flightNumber}/seat-map`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Combined Roster
        </h2>
        <p className="text-sm text-slate-500">
          Loading roster data for flight <span className="font-mono">{flightNumber}</span>...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Combined Roster
        </h2>
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Combined Roster
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Flight: <span className="font-mono">{flightNumber}</span> • Crew +
            passengers loaded from database.
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGoBackToFlightDetails}
            className="rounded-md bg-slate-900 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-800"
          >
            Back to Flight Details
          </button>
          <button
            type="button"
            onClick={handleGoToCrewAssignment}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Crew Assignment
          </button>
          <button
            type="button"
            onClick={handleGoToSeatAssignment}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Passenger Seat Assignment
          </button>
          <button
            type="button"
            onClick={handleGoToSeatMap}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Seat Map
          </button>
        </div>
      </div>

      {/* Search + sort + buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search by name, ID, seat, nationality..."
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
              <option value="role">Sort by: Role</option>
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
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Export as JSON
          </button>
          <button
            type="button"
            onClick={handleSaveToDatabase}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
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

              {filteredAndSortedRoster.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-3 text-center text-slate-500"
                    colSpan={6}
                  >
                    No roster entries match your search.
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
