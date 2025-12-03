import { useState, useMemo } from "react";

const DUMMY_FLIGHTS = [
  {
    id: "AA1234",
    dateTime: "2024-07-20 10:00 AM",
    route: "JFK - LAX",
    planeType: "Boeing 737",
    vehicleType: "Boeing 737",
    origin: "JFK",
    destination: "LAX",
  },
  {
    id: "UA5678",
    dateTime: "2024-07-20 02:30 PM",
    route: "ORD - SFO",
    planeType: "Airbus A320",
    vehicleType: "Airbus A320",
    origin: "ORD",
    destination: "SFO",
  },
  {
    id: "DL9012",
    dateTime: "2024-07-21 08:00 AM",
    route: "ATL - MIA",
    planeType: "Boeing 787",
    vehicleType: "Boeing 787",
    origin: "ATL",
    destination: "MIA",
  },
  {
    id: "SW3456",
    dateTime: "2024-07-21 11:45 AM",
    route: "DEN - PHX",
    planeType: "Boeing 737",
    vehicleType: "Boeing 737",
    origin: "DEN",
    destination: "PHX",
  },
];

export default function FlightSelectionPage() {
  const [filters, setFilters] = useState({
    flightNumber: "",
    origin: "",
    destination: "",
    date: "",
    vehicleType: "",
  });

  const handleChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const filteredFlights = useMemo(() => {
    return DUMMY_FLIGHTS.filter((f) => {
      const fn = filters.flightNumber.trim().toLowerCase();
      const origin = filters.origin.trim().toLowerCase();
      const dest = filters.destination.trim().toLowerCase();
      const veh = filters.vehicleType.trim().toLowerCase();

      if (fn && !f.id.toLowerCase().includes(fn)) return false;
      if (origin && !f.origin.toLowerCase().includes(origin)) return false;
      if (dest && !f.destination.toLowerCase().includes(dest)) return false;
      if (veh && !f.vehicleType.toLowerCase().includes(veh)) return false;

      // date filter is skipped here; you can implement when you have real dates
      return true;
    });
  }, [filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Right now filtering happens live; you could trigger API call here later.
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
              placeholder="e.g., AA1234"
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
              placeholder="Origin"
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
              placeholder="Destination"
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
        <h3 className="text-base font-semibold text-slate-900">
          Available Flights
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredFlights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col justify-between"
            >
              {/* Header: flight id + share icon */}
              <div className="flex items-start justify-between mb-3">
                <div className="text-lg font-semibold text-slate-900">
                  {flight.id}
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Share"
                >
                  {/* simple share icon */}
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
                  {flight.dateTime}
                </p>
                <p>
                  <span className="font-medium">Route:</span>{" "}
                  {flight.route}
                </p>
                <p>
                  <span className="font-medium">Plane Type:</span>{" "}
                  {flight.planeType}
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                  Select
                </button>
                <button className="flex-1 rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                  View Details
                </button>
              </div>
            </div>
          ))}

          {filteredFlights.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full">
              No flights match the selected filters.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
