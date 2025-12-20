// src/pages/Flights/CrewAssignmentPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

// =========================
// Adjustable “reasonable demo” targets
// (Spec is larger; these are scaled for small seed)
// =========================
const TARGETS = {
  pilots: {
    total: 2, // usually 2 pilots
    // keep rule: at least 1 senior + 1 junior if possible
    maxTrainee: 2,
  },
  cabin: {
    // For small seeds, keep it reasonable:
    chiefMin: 1,
    chiefMax: 1,
    seniorMin: 1,
    seniorMax: 2,
    juniorMin: 2, // <- was 4 in strict spec; reduced for demo
    juniorMax: 6,
    chefMin: 0,
    chefMax: 1,
  },
};

// --- helper: Fisher–Yates shuffle ---
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick up to n random elements from arr
function pickRandomMany(arr, n) {
  const s = shuffleArray(arr);
  return s.slice(0, Math.max(0, Math.min(n, s.length)));
}

// Normalize strings for matching
function norm(s) {
  return String(s || "").trim().toLowerCase();
}

// Vehicle match: tolerant (includes)
function vehicleMatches(memberVehicles, flightVehicle) {
  const fv = norm(flightVehicle);
  const list = Array.isArray(memberVehicles) ? memberVehicles : [];

  // If API returned null/undefined vehicles, treat as "unknown" -> allow for demo
  if (list.length === 0) return true;

  // Any vehicle restriction matches flight vehicle?
  return list.some((v) => {
    const vv = norm(v);
    if (!vv) return false;
    return fv.includes(vv) || vv.includes(fv);
  });
}

// Display cabin role short
function displayCabinRole(type) {
  const t = norm(type);
  if (t.includes("chief")) return "Chief";
  if (t.includes("senior")) return "Senior";
  if (t.includes("junior")) return "Junior";
  if (t.includes("chef")) return "Chef";
  // fallback
  return type ? String(type) : "Crew";
}

export default function CrewAssignmentPage() {
  const { flightNumber } = useParams(); // /flights/:flightNumber/crew
  const navigate = useNavigate();

  const [flightInfo, setFlightInfo] = useState(null);
  const [flightCrew, setFlightCrew] = useState([]); // pilots
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
        const flightRes = await axios.get(`${API_BASE}/api/flights/${flightNumber}`);
        const f = flightRes.data.data;

        setFlightInfo({
          flightNumber: f.flight_number,
          route: `${f.source?.airport_code || "???"} - ${f.destination?.airport_code || "???"}`,
          duration: `${f.duration_minutes} min`,
          aircraftType: f.vehicle_type?.type_name || "N/A",
          // distance might be distance_km or distance depending on your backend
          distance: f.distance_km ?? f.distance ?? null,
        });

        const [pilotsRes, cabinRes] = await Promise.all([
          axios.get(`${API_BASE}/api/pilots`),
          axios.get(`${API_BASE}/api/cabin-crew`),
        ]);

        const pilotsData = pilotsRes.data.data || [];
        const cabinData = cabinRes.data.data || [];

        // Load existing assignment (if any)
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
          if (err.response?.status !== 404) {
            console.warn("Error loading existing assignment:", err);
          }
        }

        // Map pilots
        setFlightCrew(
          pilotsData.map((p) => ({
            id: p.id,
            name: p.name,
            rank: p.seniority_level, // Senior / Junior / Trainee
            vehicleRestriction: p.vehicle_restriction || p.vehicleRestriction || null,
            allowedRange: p.allowed_range ?? p.allowedRange ?? null,
            assigned: assignedPilotIds.includes(p.id),
          }))
        );

        // Map cabin crew
        setCabinCrew(
          cabinData.map((c) => {
            const vehiclesRaw = c.vehicle_restrictions;
            const vehicles =
              Array.isArray(vehiclesRaw) ? vehiclesRaw.filter(Boolean) : [];

            return {
              id: c.id,
              name: `${c.first_name} ${c.last_name}`,
              roleRaw: c.attendant_type, // e.g. junior_flight_attendant
              role: displayCabinRole(c.attendant_type), // Junior/Senior/Chief/Chef
              vehicles, // array of type_name strings
              assigned: assignedCabinIds.includes(c.id),
            };
          })
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

    if (flightNumber) loadData();
  }, [flightNumber]);

  // =========================
  // Toggle helpers
  // =========================
  const toggleFlightCrew = (id) => {
    setFlightCrew((prev) => prev.map((c) => (c.id === id ? { ...c, assigned: !c.assigned } : c)));
  };

  const toggleCabinCrew = (id) => {
    setCabinCrew((prev) => prev.map((c) => (c.id === id ? { ...c, assigned: !c.assigned } : c)));
  };

  // =========================
  // AUTO ASSIGN (constraint-aware but flexible)
  // =========================
  const handleAutoAssign = () => {
    setError("");
    setSuccessMessage("");

    const flightVehicle = flightInfo?.aircraftType || "";
    const flightDistance = flightInfo?.distance; // might be null

    // ---------- Pilots ----------
    setFlightCrew((prev) => {
      // eligibility: vehicle + range (if distance exists)
      const eligible = prev.filter((p) => {
        const vehicleOk = !p.vehicleRestriction ? true : norm(flightVehicle).includes(norm(p.vehicleRestriction));
        const rangeOk =
          flightDistance == null || p.allowedRange == null
            ? true
            : Number(p.allowedRange) >= Number(flightDistance);
        return vehicleOk && rangeOk;
      });

      const seniors = eligible.filter((p) => norm(p.rank) === "senior");
      const juniors = eligible.filter((p) => norm(p.rank) === "junior");

      const chosen = [];

      // Keep “at least 1 senior + 1 junior” if possible
      const pickSenior = pickRandomMany(seniors, 1);
      const pickJunior = pickRandomMany(juniors, 1);
      chosen.push(...pickSenior, ...pickJunior);

      // fill remaining (up to total) from remaining eligible (include trainees up to maxTrainee)
      const chosenIds = new Set(chosen.map((x) => x.id));
      const remainingEligible = eligible.filter((p) => !chosenIds.has(p.id));

      const traineeLimit = TARGETS.pilots.maxTrainee;
      const alreadyTrainee = chosen.filter((p) => norm(p.rank) === "trainee").length;

      const remainingShuffled = shuffleArray(remainingEligible).filter((p) => {
        if (norm(p.rank) !== "trainee") return true;
        return alreadyTrainee < traineeLimit;
      });

      const need = Math.max(0, TARGETS.pilots.total - chosen.length);
      chosen.push(...remainingShuffled.slice(0, need));

      // If we couldn't satisfy senior/junior due to seed, we still assign what we can.
      if (pickSenior.length === 0 || pickJunior.length === 0) {
        setError((prevErr) => {
          const msg =
            "Auto-assign note: Not enough eligible Senior/Junior pilots to satisfy the ideal rule. Assigned best available pilots.";
          return prevErr ? `${prevErr}\n${msg}` : msg;
        });
      }

      const finalIds = new Set(chosen.map((p) => p.id));
      return prev.map((p) => ({ ...p, assigned: finalIds.has(p.id) }));
    });

    // ---------- Cabin Crew ----------
    setCabinCrew((prev) => {
      // eligibility by vehicle restriction (tolerant)
      const eligible = prev.filter((c) => vehicleMatches(c.vehicles, flightVehicle));

      const chiefs = eligible.filter((c) => norm(c.roleRaw).includes("chief"));
      const seniors = eligible.filter((c) => norm(c.roleRaw).includes("senior"));
      const juniors = eligible.filter((c) => norm(c.roleRaw).includes("junior"));
      const chefs = eligible.filter((c) => norm(c.roleRaw).includes("chef"));

      const pickedChief = pickRandomMany(chiefs, Math.min(TARGETS.cabin.chiefMax, TARGETS.cabin.chiefMin));
      const pickedSenior = pickRandomMany(
        seniors.filter((x) => !pickedChief.some((p) => p.id === x.id)),
        Math.min(TARGETS.cabin.seniorMax, Math.max(TARGETS.cabin.seniorMin, 1))
      );

      // juniors: flexible — use up to juniorMax, but if not enough, take what exists.
      const pickedJunior = pickRandomMany(
        juniors.filter((x) => ![...pickedChief, ...pickedSenior].some((p) => p.id === x.id)),
        Math.min(TARGETS.cabin.juniorMax, Math.max(TARGETS.cabin.juniorMin, 0))
      );

      // chef optional
      const pickedChef = pickRandomMany(
        chefs.filter((x) => ![...pickedChief, ...pickedSenior, ...pickedJunior].some((p) => p.id === x.id)),
        TARGETS.cabin.chefMax
      );

      const chosen = [...pickedChief, ...pickedSenior, ...pickedJunior, ...pickedChef];

      // If we’re missing juniors because seed small / vehicle filtering, warn but do not fail
      if (pickedJunior.length < TARGETS.cabin.juniorMin) {
        setError((prevErr) => {
          const msg =
            `Auto-assign note: Only ${pickedJunior.length} eligible Junior cabin crew found (target min ${TARGETS.cabin.juniorMin}). Assigned best available cabin crew.`;
          return prevErr ? `${prevErr}\n${msg}` : msg;
        });
      }

      if (chosen.length === 0) {
        setError((prevErr) => {
          const msg =
            "Auto-assign note: No eligible cabin crew found for this aircraft type. (Vehicle restrictions may be too strict.)";
          return prevErr ? `${prevErr}\n${msg}` : msg;
        });
      }

      const finalIds = new Set(chosen.map((c) => c.id));
      return prev.map((c) => ({ ...c, assigned: finalIds.has(c.id) }));
    });
  };

  // =========================
  // SAVE -> DB
  // =========================
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    const pilot_ids = flightCrew.filter((c) => c.assigned).map((c) => c.id);
    const cabin_crew_ids = cabinCrew.filter((c) => c.assigned).map((c) => c.id);

    if (pilot_ids.length === 0 || cabin_crew_ids.length === 0) {
      setError("Please assign at least one pilot and one cabin crew member.");
      setSaving(false);
      return;
    }

    const payload = { pilot_ids, cabin_crew_ids };

    try {
      const res = await axios.post(`${API_BASE}/api/flights/${flightNumber}/crew-assignments`, payload);
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
  // UI
  // =========================
  if (loading) return <p className="text-sm text-slate-500">Loading crew data...</p>;

  if (error && !flightInfo) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
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

  return (
    <div className="space-y-6">
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

      {flightInfo && (
        <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-slate-800">Flight Information Summary</p>
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
              <span className="font-medium">Route:</span> {flightInfo.route}
            </p>
            <p>
              <span className="font-medium">Duration:</span> {flightInfo.duration}
            </p>
          </div>
        </section>
      )}

      {(error || successMessage) && (
        <div className="space-y-1">
          {error && <p className="text-sm text-amber-700 whitespace-pre-line">{error}</p>}
          {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
        </div>
      )}

      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pilots */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Flight Crew (Pilots)</h3>
            <div className="space-y-3">
              {flightCrew.map((crew) => (
                <div
                  key={crew.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 bg-white ${
                    crew.assigned ? "border-blue-400 shadow-sm" : "border-slate-200"
                  }`}
                >
                  <div className="space-y-0.5 text-sm">
                    <p className="font-semibold text-slate-900">{crew.name}</p>
                    <p className="text-slate-600">Rank: {crew.rank}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFlightCrew(crew.id)}
                    className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                      crew.assigned ? "bg-slate-500 hover:bg-slate-600" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {crew.assigned ? "Unassign" : "Assign"}
                  </button>
                </div>
              ))}
              {flightCrew.length === 0 && (
                <p className="text-sm text-slate-500">No pilots found in the system.</p>
              )}
            </div>
          </div>

          {/* Cabin */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Cabin Crew</h3>
            <div className="space-y-3">
              {cabinCrew.map((crew) => (
                <div
                  key={crew.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 bg-white ${
                    crew.assigned ? "border-blue-400 shadow-sm" : "border-slate-200"
                  }`}
                >
                  <div className="space-y-0.5 text-sm">
                    <p className="font-semibold text-slate-900">{crew.name}</p>
                    <p className="text-slate-600">Role: {crew.role}</p>

                    {/* ✅ Only show Vehicles line if we actually have vehicles */}
                    {Array.isArray(crew.vehicles) && crew.vehicles.length > 0 && (
                      <p className="text-slate-500 text-xs">
                        Vehicles: {crew.vehicles.join(", ")}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCabinCrew(crew.id)}
                    className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                      crew.assigned ? "bg-slate-500 hover:bg-slate-600" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {crew.assigned ? "Unassign" : "Assign"}
                  </button>
                </div>
              ))}
              {cabinCrew.length === 0 && (
                <p className="text-sm text-slate-500">No cabin crew found in the system.</p>
              )}
            </div>
          </div>
        </div>

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
