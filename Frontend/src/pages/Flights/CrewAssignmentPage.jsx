// src/pages/Flights/CrewAssignmentPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

// --- helper: Fisher–Yates shuffle (true random order) ---
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeStr(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[-_]/g, " ")
    .trim();
}

function vehicleMatches(pilotVehicle, flightVehicle) {
  const p = normalizeStr(pilotVehicle);
  const f = normalizeStr(flightVehicle);
  if (!p || !f) return false;

  // tolerant match: either includes the other
  return p.includes(f) || f.includes(p);
}

function formatCabinRole(type) {
  if (!type) return "";
  const t = String(type).toLowerCase();
  if (t === "chief") return "Chief";
  if (t === "chef") return "Chef";
  if (t.includes("senior")) return "Senior";
  if (t.includes("junior")) return "Junior";
  return type;
}

export default function CrewAssignmentPage() {
  const { flightNumber } = useParams(); // /flights/:flightNumber/crew
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
        const flightRes = await axios.get(`${API_BASE}/api/flights/${flightNumber}`);
        const f = flightRes.data.data;

        // distance field names can differ; try common ones
        const distanceKm =
          Number(f.flight_distance_km ?? f.distance_km ?? f.flight_distance ?? f.distance) || null;

        setFlightInfo({
          flightNumber: f.flight_number,
          route: `${f.source.airport_code} - ${f.destination.airport_code}`,
          duration: `${f.duration_minutes} min`,
          aircraftType: f.vehicle_type?.type_name || "N/A",
          distanceKm,
        });

        const [pilotsRes, cabinRes] = await Promise.all([
          axios.get(`${API_BASE}/api/pilots`),
          axios.get(`${API_BASE}/api/cabin-crew`),
        ]);

        const pilotsData = pilotsRes.data.data || [];
        const cabinData = cabinRes.data.data || [];

        // existing assignment (if any)
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
          if (err.response?.status !== 404) console.warn("Error loading existing assignment:", err);
        }

        setFlightCrew(
          pilotsData.map((p) => ({
            id: p.id,
            name: p.name,
            rank: p.seniority_level, // Senior | Junior | Trainee
            vehicle:
              p.vehicle_restriction ||
              p.vehicleRestriction ||
              p.vehicle_type?.type_name ||
              "",
            allowedRange: Number(p.allowed_range ?? p.allowedRange ?? 0) || 0,
            assigned: assignedPilotIds.includes(p.id),
          }))
        );

        setCabinCrew(
          cabinData.map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            role: formatCabinRole(c.attendant_type),
            vehicleRestrictions: Array.isArray(c.vehicle_restrictions)
              ? c.vehicle_restrictions.filter(Boolean)
              : [],
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

    if (flightNumber) loadData();
  }, [flightNumber]);

  // =========================
  // Toggle helpers
  // =========================
  const toggleFlightCrew = (id) => {
    setFlightCrew((prev) =>
      prev.map((c) => (c.id === id ? { ...c, assigned: !c.assigned } : c))
    );
  };

  const toggleCabinCrew = (id) => {
    setCabinCrew((prev) =>
      prev.map((c) => (c.id === id ? { ...c, assigned: !c.assigned } : c))
    );
  };

  // =========================
  // Eligibility checks
  // =========================
  const isPilotEligible = (p) => {
    const aircraft = flightInfo?.aircraftType;
    if (!aircraft || aircraft === "N/A") return true; // if we can't know, don't block

    // vehicle restriction must match (auto-assign should never pick mismatch)
    if (!p.vehicle) return false;
    if (!vehicleMatches(p.vehicle, aircraft)) return false;

    // distance check only if we have distance
    const dist = Number(flightInfo?.distanceKm);
    if (Number.isFinite(dist) && dist > 0) {
      const range = Number(p.allowedRange);
      if (!Number.isFinite(range) || range <= 0) return false;
      if (range < dist) return false;
    }

    return true;
  };

  const isCabinEligible = (c) => {
    const aircraft = flightInfo?.aircraftType;
    if (!aircraft || aircraft === "N/A") return true;

    // If no restriction list -> treat as eligible (seed küçük diye bloklamayalım)
    const list = c.vehicleRestrictions || [];
    if (!list.length) return true;

    // If has list -> must contain aircraft type (tolerant match)
    return list.some((v) => vehicleMatches(v, aircraft));
  };

  // =========================
  // AUTO ASSIGN (RANDOM + VEHICLE SAFE)
  // =========================
  const handleAutoAssign = () => {
    setError("");
    setSuccessMessage("");

    const PILOT_COUNT = 2;
    const CABIN_COUNT = 3;

    // ---- Pilots: eligible + prefer 1 Senior + 1 Junior
    setFlightCrew((prev) => {
      const eligible = prev.filter(isPilotEligible);

      if (eligible.length === 0) {
        setError("Auto-assign failed: No eligible pilots for this aircraft (and/or distance).");
        return prev.map((p) => ({ ...p, assigned: false }));
      }

      const seniors = shuffleArray(eligible.filter((p) => p.rank === "Senior"));
      const juniors = shuffleArray(eligible.filter((p) => p.rank === "Junior"));
      const rest = shuffleArray(
        eligible.filter((p) => p.rank !== "Senior" && p.rank !== "Junior")
      );

      const picked = [];
      if (seniors[0]) picked.push(seniors[0]);
      if (juniors[0]) picked.push(juniors[0]);

      // fill remaining slots (if any)
      const already = new Set(picked.map((p) => p.id));
      const pool = [...seniors, ...juniors, ...rest].filter((p) => !already.has(p.id));
      while (picked.length < Math.min(PILOT_COUNT, eligible.length) && pool.length) {
        picked.push(pool.shift());
      }

      // if we couldn't satisfy senior+junior, warn but still pick eligible
      if (!seniors.length || !juniors.length) {
        const msgParts = [];
        if (!seniors.length) msgParts.push("Senior");
        if (!juniors.length) msgParts.push("Junior");
        setError(
          `Auto-assign note: Not enough eligible ${msgParts.join(" & ")} pilots. Picked from eligible pool.`
        );
      }

      const selectedIds = new Set(picked.map((p) => p.id));
      return prev.map((p) => ({ ...p, assigned: selectedIds.has(p.id) }));
    });

    // ---- Cabin crew: eligible by aircraft type (if restrictions exist)
    setCabinCrew((prev) => {
      const eligible = prev.filter(isCabinEligible);
      if (eligible.length === 0) {
        // cabin tarafında tamamen fail etmek yerine boş bırak
        return prev.map((c) => ({ ...c, assigned: false }));
      }
      const shuffled = shuffleArray(eligible);
      const pickCount = Math.min(CABIN_COUNT, shuffled.length);
      const selectedIds = new Set(shuffled.slice(0, pickCount).map((c) => c.id));
      return prev.map((c) => ({ ...c, assigned: selectedIds.has(c.id) }));
    });
  };

  // =========================
  // SAVE -> DB (frontend validation)
  // =========================
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    const selectedPilots = flightCrew.filter((c) => c.assigned);
    const selectedCabin = cabinCrew.filter((c) => c.assigned);

    if (selectedPilots.length === 0 || selectedCabin.length === 0) {
      setError("Please assign at least one pilot and one cabin crew member.");
      setSaving(false);
      return;
    }

    // prevent saving mismatch pilots
    const badPilots = selectedPilots.filter((p) => !isPilotEligible(p));
    if (badPilots.length) {
      setError(
        `Cannot save: Some selected pilots are not eligible for this aircraft/distance: ${badPilots
          .map((p) => p.name)
          .join(", ")}`
      );
      setSaving(false);
      return;
    }

    const pilot_ids = selectedPilots.map((c) => c.id);
    const cabin_crew_ids = selectedCabin.map((c) => c.id);
    const payload = { pilot_ids, cabin_crew_ids };

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
  // UI
  // =========================
  if (loading) return <p className="text-sm text-slate-500">Loading crew data...</p>;

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
              <span className="font-medium">Flight Number:</span> {flightInfo.flightNumber}
            </p>
            <p>
              <span className="font-medium">Aircraft Type:</span> {flightInfo.aircraftType}
            </p>
            {flightInfo.distanceKm ? (
              <p>
                <span className="font-medium">Distance:</span> {flightInfo.distanceKm} km
              </p>
            ) : null}
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
          {error && <p className="text-sm text-red-600">{error}</p>}
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
                    {crew.vehicle ? (
                      <p className="text-slate-600">Vehicle: {crew.vehicle}</p>
                    ) : null}
                    {crew.allowedRange ? (
                      <p className="text-slate-600">Range: {crew.allowedRange} km</p>
                    ) : null}
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
                <p className="text-sm text-slate-500">No pilots found in the system.</p>
              )}
            </div>
          </div>

          {/* Cabin crew */}
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
                    {/* boşsa hiç yazmasın */}
                    {crew.vehicleRestrictions?.length ? (
                      <p className="text-slate-600">
                        Vehicles: {crew.vehicleRestrictions.join(", ")}
                      </p>
                    ) : null}
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
