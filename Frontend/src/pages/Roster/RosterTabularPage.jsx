// src/pages/Roster/RosterTabularPage.jsx
import { useMemo, useState } from "react";

const INITIAL_ROSTER = [
  {
    type: "Pilot",
    name: "John Doe",
    id: "P101",
    seatNo: "Cockpit",
    nationality: "American",
    role: "Captain",
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
    type: "Passenger",
    name: "Alice Johnson",
    id: "PA301",
    seatNo: "12A",
    nationality: "Canadian",
    role: "N/A",
  },
  {
    type: "Passenger",
    name: "Bob Williams",
    id: "PA302",
    seatNo: "12B",
    nationality: "German",
    role: "N/A",
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
    name: "Michael Davis",
    id: "CC202",
    seatNo: "A2",
    nationality: "Australian",
    role: "Flight Attendant",
  },
  {
    type: "Passenger",
    name: "Sarah Miller",
    id: "PA303",
    seatNo: "14C",
    nationality: "Japanese",
    role: "N/A",
  },
];

export default function RosterTabularPage() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name"); // name | type | seatNo

  const filteredAndSortedRoster = useMemo(() => {
    const lower = search.trim().toLowerCase();

    let data = INITIAL_ROSTER.filter((item) => {
      if (!lower) return true;
      return (
        item.type.toLowerCase().includes(lower) ||
        item.name.toLowerCase().includes(lower) ||
        item.id.toLowerCase().includes(lower) ||
        item.seatNo.toLowerCase().includes(lower) ||
        item.nationality.toLowerCase().includes(lower) ||
        item.role.toLowerCase().includes(lower)
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
  }, [search, sortKey]);

  const handleExportJSON = () => {
    const blob = new Blob(
      [JSON.stringify(filteredAndSortedRoster, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roster.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveToDatabase = () => {
    // later: replace with real API call
    console.log("Saving to database:", filteredAndSortedRoster);
    alert("Roster would be saved to database (see console for payload).");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">
        Combined Roster
      </h2>

      {/* Search + sort + buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search..."
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
