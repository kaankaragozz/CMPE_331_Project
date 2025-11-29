export default function DashboardPage() {
  // Dummy data – later you can replace with real API data
  const stats = [
    { label: "Flights today", value: 12, sub: "+3 vs yesterday" },
    { label: "Rosters generated", value: 8, sub: "4 remaining" },
    { label: "Pending flights", value: 4, sub: "need crew assignment" },
    { label: "Crew available", value: 32, sub: "pilots + cabin crew" },
  ];

  const upcomingFlights = [
    {
      id: "AB1234",
      route: "IST → LHR",
      time: "Today • 14:30",
      aircraft: "A320",
      status: "Roster ready",
    },
    {
      id: "AB1456",
      route: "IST → AMS",
      time: "Today • 16:10",
      aircraft: "B737",
      status: "Needs cabin crew",
    },
    {
      id: "AB1678",
      route: "IST → CDG",
      time: "Today • 18:45",
      aircraft: "A321",
      status: "Needs pilots",
    },
  ];

  const activities = [
    "Roster generated for AB1234 (IST → LHR)",
    "Cabin crew updated for AB1456",
    "Passenger seats auto-assigned for AB1678",
    "New crew member added to pool",
  ];

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
          <button className="inline-flex items-center rounded-lg bg-slate-900 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 hover:bg-slate-800">
            Generate new roster
          </button>
          <button className="inline-flex items-center rounded-lg border border-slate-300 text-xs sm:text-sm px-3 sm:px-4 py-2 text-slate-700 hover:bg-slate-50">
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
            <button className="text-xs text-slate-500 hover:text-slate-800">
              View all
            </button>
          </div>

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
                  className="border-b last:border-0 border-slate-100"
                >
                  <td className="py-2 font-medium text-slate-900">
                    {f.id}
                  </td>
                  <td className="py-2 text-slate-700">{f.route}</td>
                  <td className="py-2 text-slate-600">{f.time}</td>
                  <td className="py-2 text-slate-600">{f.aircraft}</td>
                  <td className="py-2 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${f.status === "Roster ready"
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
