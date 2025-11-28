export default function FlightSearchPage() {
  // later: replace with real API calls
  const flights = [
    {
      id: "AB1234",
      origin: "IST",
      destination: "LHR",
      date: "2025-05-10 14:30",
      aircraft: "A320",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Search Flights</h2>
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Flight number (e.g., AB1234)"
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            placeholder="Origin (city/airport)"
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            placeholder="Destination"
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <button className="bg-slate-800 text-white text-sm rounded px-4 py-2">
            Search
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">Results</h3>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="py-2">Flight</th>
              <th className="py-2">Route</th>
              <th className="py-2">Date & Time</th>
              <th className="py-2">Aircraft</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="py-2">{f.id}</td>
                <td className="py-2">
                  {f.origin} → {f.destination}
                </td>
                <td className="py-2">{f.date}</td>
                <td className="py-2">{f.aircraft}</td>
                <td className="py-2 text-right">
                  <button className="text-xs bg-slate-800 text-white px-3 py-1 rounded">
                    View / Generate Roster
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
