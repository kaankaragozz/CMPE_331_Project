// src/pages/Flights/FlightCrewAssignmentPage.jsx
import { useState } from "react";

const FLIGHT_INFO = {
  flightNumber: "FL123",
  route: "JFK - LAX",
  duration: "5h 30m",
  aircraftType: "Boeing 747",
};

const INITIAL_FLIGHT_CREW = [
  { id: 1, name: "John Doe", rank: "Senior Pilot" },
  { id: 2, name: "Jane Smith", rank: "Junior Pilot" },
  { id: 3, name: "Peter Jones", rank: "Trainee Pilot" },
];

const INITIAL_CABIN_CREW = [
  { id: 4, name: "Alice Brown", role: "Chief Attendant" },
  { id: 5, name: "Bob White", role: "Junior Attendant" },
  { id: 6, name: "Charlie Green", role: "Chef" },
  { id: 7, name: "Diana Black", role: "Junior Attendant" },
];

export default function FlightCrewAssignmentPage() {
  const [flightCrew, setFlightCrew] = useState(
    INITIAL_FLIGHT_CREW.map((c) => ({ ...c, assigned: false }))
  );
  const [cabinCrew, setCabinCrew] = useState(
    INITIAL_CABIN_CREW.map((c) => ({ ...c, assigned: false }))
  );

  const toggleFlightCrew = (id) => {
    setFlightCrew((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, assigned: !c.assigned } : c
      )
    );
  };

  const toggleCabinCrew = (id) => {
    setCabinCrew((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, assigned: !c.assigned } : c
      )
    );
  };

  const handleAutoAssign = () => {
    // super simple demo logic – you can replace with real rules later
    setFlightCrew((prev) =>
      prev.map((c, idx) => ({
        ...c,
        assigned: idx < 2, // assign first 2 pilots
      }))
    );
    setCabinCrew((prev) =>
      prev.map((c, idx) => ({
        ...c,
        assigned: idx < 3, // assign first 3 cabin crew
      }))
    );
  };

  const handleSave = () => {
    const selectedFlightCrew = flightCrew.filter((c) => c.assigned);
    const selectedCabinCrew = cabinCrew.filter((c) => c.assigned);
    // later: send to backend
    console.log("Saving selection:", {
      flightCrew: selectedFlightCrew,
      cabinCrew: selectedCabinCrew,
    });
    alert("Crew selection saved (check console for payload).");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">
        Flight Details and Crew Assignment
      </h2>

      {/* Flight info summary */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-slate-800">
            Flight Information Summary
          </p>
          <p>
            <span className="font-medium">Flight Number:</span>{" "}
            {FLIGHT_INFO.flightNumber}
          </p>
          <p>
            <span className="font-medium">Aircraft Type:</span>{" "}
            {FLIGHT_INFO.aircraftType}
          </p>
        </div>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Route:</span>{" "}
            {FLIGHT_INFO.route}
          </p>
          <p>
            <span className="font-medium">Duration:</span>{" "}
            {FLIGHT_INFO.duration}
          </p>
        </div>
      </section>

      {/* Crew panels */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Flight crew */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Flight Crew
            </h3>
            <div className="space-y-3">
              {flightCrew.map((crew) => (
                <div
                  key={crew.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 bg-white ${
                    crew.assigned
                      ? "border-blue-400 shadow-sm"
                      : "border-slate-200"
                  }`}
                >
                  <div className="space-y-0.5 text-sm">
                    <p className="font-semibold text-slate-900">
                      {crew.name}
                    </p>
                    <p className="text-slate-600">
                      Rank: {crew.rank}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFlightCrew(crew.id)}
                    className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                      crew.assigned
                        ? "bg-slate-500 hover:bg-slate-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {crew.assigned ? "Unassign" : "Assign"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cabin crew */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Cabin Crew
            </h3>
            <div className="space-y-3">
              {cabinCrew.map((crew) => (
                <div
                  key={crew.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 bg-white ${
                    crew.assigned
                      ? "border-blue-400 shadow-sm"
                      : "border-slate-200"
                  }`}
                >
                  <div className="space-y-0.5 text-sm">
                    <p className="font-semibold text-slate-900">
                      {crew.name}
                    </p>
                    <p className="text-slate-600">
                      Role: {crew.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCabinCrew(crew.id)}
                    className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                      crew.assigned
                        ? "bg-slate-500 hover:bg-slate-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {crew.assigned ? "Unassign" : "Assign"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleAutoAssign}
            className="inline-flex justify-center rounded-md bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-600"
          >
            Auto-Assign Crew
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save Crew Selection
          </button>
        </div>
      </section>
    </div>
  );
}
