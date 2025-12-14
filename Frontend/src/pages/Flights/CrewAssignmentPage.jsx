// src/pages/Flights/FlightCrewAssignmentPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

function formatDate(isoString) {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export default function FlightCrewAssignmentPage() {
  const { flightNumber } = useParams();
  const navigate = useNavigate();

  const [flightInfo, setFlightInfo] = useState(null);
  const [flightCrew, setFlightCrew] = useState([]);
  const [cabinCrew, setCabinCrew] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const [flightRes, pilotsRes, cabinRes, assignRes] = await Promise.all([
          fetch(`${API_BASE_URL}/flight/${flightNumber}`),
          fetch(`${API_BASE_URL}/pilots`),
          fetch(`${API_BASE_URL}/cabin_crew`),
          fetch(`${API_BASE_URL}/flight/${flightNumber}/crew`),
        ]);

        if (!flightRes.ok) throw new Error(`Failed to load flight (${flightRes.status})`);
        if (!pilotsRes.ok) throw new Error(`Failed to load pilots (${pilotsRes.status})`);
        if (!cabinRes.ok) throw new Error(`Failed to load cabin crew (${cabinRes.status})`);

        const flightJson = await flightRes.json();
        const pilotsJson = await pilotsRes.json();
        const cabinJson = await cabinRes.json();

        const assignmentJson = assignRes.ok ? await assignRes.json() : { data: {} };

        const flight = flightJson.data || flightJson;
        const pilotsRaw = pilotsJson.data || pilotsJson;
        const cabinRaw = cabinJson.data || cabinJson;

        const assignedPilots = new Set(
          (assignmentJson.data?.pilots || []).map(
            (p) => p.id ?? p.pilot_id
          )
        );
        const assignedCabin = new Set(
          (assignmentJson.data?.cabin_crew || []).map(
            (c) => c.id ?? c.attendant_id
          )
        );

        const mappedPilots = (pilotsRaw || []).map((p, idx) => {
          const id = p.id ?? p.pilot_id ?? idx;
          return {
            id,
            name:
              p.full_name ||
              [p.first_name, p.last_name].filter(Boolean).join(" ") ||
              p.name ||
              "Unnamed Pilot",
            rank: p.seniority_level || p.rank || "Pilot",
            assigned: assignedPilots.has(id),
          };
        });

        const mappedCabin = (cabinRaw || []).map((c, idx) => {
          const id = c.id ?? c.attendant_id ?? idx;
          return {
            id,
            name:
              c.full_name ||
              [c.first_name, c.last_name].filter(Boolean).join(" ") ||
              c.name ||
              "Unnamed Attendant",
            role:
              c.attendant_type_name ||
              c.attendant_type ||
              c.role ||
              "Cabin Attendant",
            assigned: assignedCabin.has(id),
          };
        });

        setFlightInfo(flight);
        setFlightCrew(mappedPilots);
        setCabinCrew(mappedCabin);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [flightNumber]);

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
    setFlightCrew((prev) => {
      const seniors = prev.filter((p) =>
        p.rank?.toLowerCase().includes("senior")
      );
      const juniors = prev.filter((p) =>
        p.rank?.toLowerCase().includes("junior")
      );
      const trainees = prev.filter((p) =>
        p.rank?.toLowerCase().includes("trainee")
      );

      const selected = new Set();
      if (seniors[0]) selected.add(seniors[0].id);
      if (juniors[0]) selected.add(juniors[0].id);
      if (trainees[0]) selected.add(trainees[0].id);
      if (trainees[1]) selected.add(trainees[1].id);

      return prev.map((p) => ({
        ...p,
        assigned: selected.has(p.id),
      }));
    });

    setCabinCrew((prev) => {
      const chiefs = prev.filter((c) =>
        c.role?.toLowerCase().includes("chief")
      );
      const juniors = prev.filter((c) => {
        const r = c.role?.toLowerCase() || "";
        return r.includes("junior") || r.includes("regular");
      });
      const chefs = prev.filter((c) =>
        c.role?.toLowerCase().includes("chef")
      );

      const selected = new Set();
      chiefs.slice(0, 4).forEach((c) => selected.add(c.id));
      juniors.slice(0, 16).forEach((c) => selected.add(c.id));
      chefs.slice(0, 2).forEach((c) => selected.add(c.id));

      return prev.map((c) => ({
        ...c,
        assigned: selected.has(c.id),
      }));
    });
  };

  const handleSave = async () => {
    const selectedFlightCrew = flightCrew.filter((c) => c.assigned);
    const selectedCabinCrew = cabinCrew.filter((c) => c.assigned);

    if (selectedFlightCrew.length === 0 || selectedCabinCrew.length === 0) {
      alert("Please assign at least one flight crew and one cabin crew member.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        flight_number: flightNumber,
        pilots: selectedFlightCrew.map((p) => p.id),
        cabin_crew: selectedCabinCrew.map((c) => c.id),
      };

      const res = await fetch(`${API_BASE_URL}/flight/${flightNumber}/crew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to save crew assignment (${res.status}): ${text}`
        );
      }

      setSuccessMessage("Crew selection saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save crew selection.");
    } finally {
      setSaving(false);
    }
  };

  const handleBackToFlights = () => {
    navigate("/flights");
  };

  if (loading && !flightInfo) {
    return (
      <p className="p-6 text-sm text-slate-500">
        Loading flight and crew data...
      </p>
    );
  }

  if (error && !flightInfo) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-red-500">{error}</p>
        <button
          type="button"
          onClick={handleBackToFlights}
          className="inline-flex items-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Flights
        </button>
      </div>
    );
  }

  const route = flightInfo
    ? `${flightInfo.source?.airport_code || flightInfo.source?.code || "??"} - ${
        flightInfo.destination?.airport_code ||
        flightInfo.destination?.code ||
        "??"
      }`
    : "Route unknown";

  const aircraftType = flightInfo?.vehicle_type?.type_name || "Unknown aircraft";
  const duration = flightInfo?.duration_minutes
    ? `${flightInfo.duration_minutes} min`
    : "N/A";
  const date = flightInfo ? formatDate(flightInfo.flight_date) : "N/A";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">
          Flight Details and Crew Assignment
        </h2>
        <button
          type="button"
          onClick={handleBackToFlights}
          className="inline-flex items-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Flights
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="text-sm text-emerald-600">
          {successMessage}
        </p>
      )}

      {/* Flight info summary */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-slate-800">
            Flight Information Summary
          </p>
          <p>
            <span className="font-medium">Flight Number:</span>{" "}
            {flightInfo?.flight_number}
          </p>
          <p>
            <span className="font-medium">Aircraft Type:</span>{" "}
            {aircraftType}
          </p>
        </div>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Route:</span> {route}
          </p>
          <p>
            <span className="font-medium">Date / Duration:</span>{" "}
            {date} • {duration}
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
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
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

              {flightCrew.length === 0 && (
                <p className="text-sm text-slate-500">
                  No pilots found in the system.
                </p>
              )}
            </div>
          </div>

          {/* Cabin crew */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Cabin Crew
            </h3>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
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

              {cabinCrew.length === 0 && (
                <p className="text-sm text-slate-500">
                  No cabin crew found in the system.
                </p>
              )}
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
            disabled={saving}
            onClick={handleSave}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Crew Selection"}
          </button>
        </div>
      </section>
    </div>
  );
}
