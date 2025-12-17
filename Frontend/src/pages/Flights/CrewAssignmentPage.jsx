// src/pages/Flights/CrewAssignmentPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export default function CrewAssignmentPage() {
  const { flightNumber } = useParams();              // ✅ comes from route /flights/:flightNumber/crew
  const navigate = useNavigate();

  const [flightInfo, setFlightInfo] = useState(null);
  const [flightCrew, setFlightCrew] = useState([]);
  const [cabinCrew, setCabinCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =========================
  // Load flight + crew data
  // =========================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        // 1) Flight details
        const flightRes = await axios.get(
          `${API_BASE}/api/flights/${flightNumber}`
        );

        const f = flightRes.data.data; // from flightsController getFlightByNumber

        setFlightInfo({
          flightNumber: f.flight_number,
          route: `${f.source.airport_code} - ${f.destination.airport_code}`,
          duration: `${f.duration_minutes} min`,
          aircraftType: f.vehicle_type?.type_name || "N/A",
        });

        // 2) Load all pilots & cabin crew
        const [pilotsRes, cabinRes] = await Promise.all([
          axios.get(`${API_BASE}/api/pilots`),
          axios.get(`${API_BASE}/api/cabin-crew`),
        ]);

        const pilotsData = pilotsRes.data.data || [];
        const cabinData = cabinRes.data.data || [];

        // 3) Load existing assignment (if any)
        let assignedPilotIds = [];
        let assignedCabinIds = [];

        try {
          const assignmentRes = await axios.get(
            `${API_BASE}/api/flights/${flightNumber}/crew-assignments`
          );
          if (assignmentRes.data?.success && assignmentRes.data.data) {
            assignedPilotIds = assignmentRes.data.data.pilot_ids || [];
            assignedCabinIds = assignmentRes.data.data.cabin_crew_ids || [];
          }
        } catch (err) {
          // If 404: no assignment yet -> ignore
          if (err.response?.status !== 404) {
            console.warn("Error loading existing assignment:", err);
          }
        }

        // 4) Map pilots & cabin crew into UI state
        setFlightCrew(
          pilotsData.map((p) => ({
            id: p.id,
            name: p.name,
            rank: p.seniority_level,
            assigned: assignedPilotIds.includes(p.id),
          }))
        );

        setCabinCrew(
          cabinData.map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            role: c.attendant_type,
            assigned: assignedCabinIds.includes(c.id),
          }))
        );
      } catch (err) {
        console.error("Error loading data:", err);
        setError(
          err.response?.data?.message
            ? `Error loading data: ${err.response.data.message}`
            : "Error loading data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (flightNumber) {
      loadData();
    }
  }, [flightNumber]);

  // =========================
  // Toggle helpers
  // =========================
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

  // super simple demo logic
  const handleAutoAssign = () => {
    setFlightCrew((prev) =>
      prev.map((c, idx) => ({
        ...c,
        assigned: idx < 2, // first 2 pilots
      }))
    );
    setCabinCrew((prev) =>
      prev.map((c, idx) => ({
        ...c,
        assigned: idx < 3, // first 3 cabin crew
      }))
    );
  };

  // =========================
  // SAVE -> DB
  // =========================
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    const pilot_ids = flightCrew
      .filter((c) => c.assigned)
      .map((c) => c.id);
    const cabin_crew_ids = cabinCrew
      .filter((c) => c.assigned)
      .map((c) => c.id);

    if (pilot_ids.length === 0 || cabin_crew_ids.length === 0) {
      setError("Please assign at least one pilot and one cabin crew member.");
      setSaving(false);
      return;
    }

    const payload = { pilot_ids, cabin_crew_ids }; // ✅ this is the payload

    try {
      const res = await axios.post(
        `${API_BASE}/api/flights/${flightNumber}/crew-assignments`,
        payload
      );
      console.log("Saved crew assignment:", res.data);
      setSuccessMessage("Crew assignment saved successfully.");
    } catch (err) {
      console.error("Error saving crew assignment:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save crew assignment. Check console for details."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Loading / error states
  // =========================
  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading crew data...
      </p>
    );
  }

  if (error && !flightInfo) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/flights")}
          className="inline-flex rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
        >
          Back to Flights
        </button>
      </div>
    );
  }

  // =========================
  // Main UI
  // =========================
  return (
    <div className="space-y-6">
      {/* Simple top navigation – adjust paths to your routing if needed */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => navigate("/")}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/flights")}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Flights
        </button>
        <button
          onClick={() => navigate("/crew")}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Crew Overview
        </button>
        <button
          onClick={() => navigate("/passengers")}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Passengers
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-slate-900">
        Flight Details and Crew Assignment
      </h2>

      {/* Flight info summary */}
      {flightInfo && (
        <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-slate-800">
              Flight Information Summary
            </p>
            <p>
              <span className="font-medium">Flight Number:</span>{" "}
              {flightInfo.flightNumber}
            </p>
            <p>
              <span className="font-medium">Aircraft Type:</span>{" "}
              {flightInfo.aircraftType}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Route:</span>{" "}
              {flightInfo.route}
            </p>
            <p>
              <span className="font-medium">Duration:</span>{" "}
              {flightInfo.duration}
            </p>
          </div>
        </section>
      )}

      {/* Info messages */}
      {(error || successMessage) && (
        <div className="space-y-1">
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-sm text-emerald-600">
              {successMessage}
            </p>
          )}
        </div>
      )}

      {/* Crew panels */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Flight crew */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Flight Crew (Pilots)
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
            onClick={handleSave}
            disabled={saving}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Crew Selection"}
          </button>
        </div>
      </section>
    </div>
  );
}
