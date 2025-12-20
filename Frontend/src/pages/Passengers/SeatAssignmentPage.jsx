// src/pages/Passengers/PassengerSeatAssignmentPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

const ROWS = 15;
const SEAT_LETTERS = ["A", "B", "C", "D"];

// Decide infant using either backend field OR age rule (0–2)
function isInfantPassenger(raw) {
  if (raw?.is_infant === true) return true;
  const age = Number(raw?.age);
  return Number.isFinite(age) && age >= 0 && age <= 2;
}

function getLastToken(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

// Demo-only parent picking rule (no backend changes):
// 1) same last-name + female
// 2) same last-name anyone
// 3) first adult
function pickDefaultParentId(infantName, adults) {
  const last = getLastToken(infantName).toLowerCase();
  if (!last) return "";

  const sameLastFemale = adults.find((a) => {
    const adultLast = getLastToken(a.name).toLowerCase();
    const gender = String(a.gender || "").toLowerCase();
    return adultLast === last && gender === "female";
  });
  if (sameLastFemale) return String(sameLastFemale.id);

  const sameLastAny = adults.find((a) => {
    const adultLast = getLastToken(a.name).toLowerCase();
    return adultLast === last;
  });
  if (sameLastAny) return String(sameLastAny.id);

  return adults.length ? String(adults[0].id) : "";
}

export default function PassengerSeatAssignmentPage() {
  const { flightNumber } = useParams(); // /flights/:flightNumber/passengers
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [passengers, setPassengers] = useState([]);
  const [originalPassengers, setOriginalPassengers] = useState([]);

  // infantPassengerId -> parentPassengerId (locked demo map)
  const [infantParents, setInfantParents] = useState({});

  const storageKey = useMemo(() => {
    return flightNumber
      ? `infantParentMap_${flightNumber}`
      : "infantParentMap_unknownFlight";
  }, [flightNumber]);

  // All possible seats (1A..15D)
  const ALL_SEATS = useMemo(() => {
    const seats = [];
    for (let row = 1; row <= ROWS; row++) {
      for (const letter of SEAT_LETTERS) {
        seats.push(`${row}${letter}`);
      }
    }
    return seats;
  }, []);

  // ---- LOAD PASSENGERS FOR THIS FLIGHT ----
  const loadPassengers = useCallback(async () => {
    if (!flightNumber) return;

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await axios.get(
        `${API_BASE}/api/passengers/flight/${flightNumber}`
      );
      const data = res.data?.data || [];

      // Map backend payload -> UI state
      const mapped = data.map((p) => {
        const infant = isInfantPassenger(p);
        return {
          id: p.passenger_id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          nationality: p.nationality,
          seatType: p.seat_class || "N/A",
          seatNumber: infant ? "" : p.seat_number || "",
          isInfant: infant,
        };
      });

      setPassengers(mapped);
      setOriginalPassengers(mapped);

      // Adults list for choosing parents
      const adults = mapped.filter((x) => !x.isInfant);

      // Load saved parent map (demo persistence)
      let savedMap = {};
      try {
        const raw = localStorage.getItem(storageKey);
        savedMap = raw ? JSON.parse(raw) || {} : {};
      } catch {
        savedMap = {};
      }

      // Build locked parent mapping:
      const initParents = {};
      for (const p of mapped) {
        if (!p.isInfant) continue;

        const savedParent = savedMap[String(p.id)];
        initParents[String(p.id)] =
          savedParent || pickDefaultParentId(p.name, adults) || "";
      }

      setInfantParents(initParents);

      // Persist immediately so it stays stable and "not changeable"
      try {
        localStorage.setItem(storageKey, JSON.stringify(initParents));
      } catch {
        // ignore localStorage failures
      }
    } catch (err) {
      console.error("Error loading passengers:", err);
      setError("Failed to load passengers for this flight.");
    } finally {
      setLoading(false);
    }
  }, [flightNumber, storageKey]);

  useEffect(() => {
    loadPassengers();
  }, [loadPassengers]);

  // Seats taken by non-infant passengers only
  const assignedSeats = useMemo(() => {
    return new Set(
      passengers
        .filter((p) => !p.isInfant)
        .map((p) => p.seatNumber)
        .filter(Boolean)
    );
  }, [passengers]);

  // Seat options for a passenger:
  // all seats not taken by someone else + their current seat
  const getSeatOptionsForPassenger = (currentSeat) => {
    return ALL_SEATS.filter(
      (seat) => !assignedSeats.has(seat) || seat === currentSeat
    );
  };

  const handleSeatChange = (id, seat) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.isInfant) return { ...p, seatNumber: "" }; // protect
        return { ...p, seatNumber: seat || "" };
      })
    );
  };

  // For displaying parent name
  const passengerNameById = useMemo(() => {
    const map = {};
    for (const p of passengers) {
      map[String(p.id)] = p.name;
    }
    return map;
  }, [passengers]);

  const getInfantParentLabel = (infantId) => {
    const parentId = infantParents[String(infantId)];
    if (!parentId) return "Parent: N/A";

    const name = passengerNameById[String(parentId)];
    if (name) return `Parent: ${name}`;

    return `Parent ID: ${parentId}`;
  };

  // ---- BACKEND AUTO ASSIGN ----
  const handleAutoAssign = async () => {
    if (!flightNumber) return;

    setSaving(true);
    setError("");
    setInfo("");

    try {
      const res = await axios.post(
        `${API_BASE}/api/passengers/flight/${flightNumber}/assign-seats`
      );

      setInfo(res.data?.message || "Auto-assigned seats successfully.");
      await loadPassengers();
    } catch (err) {
      console.error("Error auto-assigning seats:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to auto-assign seats. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ---- SAVE MANUAL CHANGES (adults only) ----
  const handleSave = async () => {
    if (!flightNumber) return;

    setSaving(true);
    setError("");
    setInfo("");

    try {
      // persist locked parent map for demo
      try {
        localStorage.setItem(storageKey, JSON.stringify(infantParents));
      } catch {
        // ignore
      }

      const originalById = {};
      for (const p of originalPassengers) {
        originalById[p.id] = p.seatNumber || "";
      }

      const updates = passengers
        .filter((p) => !p.isInfant)
        .filter((p) => (p.seatNumber || "") !== (originalById[p.id] || ""))
        .filter((p) => p.seatNumber); // must have a seat to update

      if (updates.length === 0) {
        setInfo("No adult seat changes to save. Infant parent info is locked.");
        setSaving(false);
        return;
      }

      await Promise.all(
        updates.map((p) =>
          axios.put(
            `${API_BASE}/api/passengers/flight/${flightNumber}/manual-assign`,
            {
              passenger_id: p.id,
              seat_number: p.seatNumber,
            }
          )
        )
      );

      setInfo("Seat assignments saved. Infant parent info remains locked.");
      await loadPassengers();
    } catch (err) {
      console.error("Error saving seat assignments:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to save seat assignments. Check console for details.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-slate-500">Loading passenger seat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + navigation buttons */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Passenger Information and Seat Assignment
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Flight <span className="font-semibold">{flightNumber}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/flights")}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back to flights
          </button>
          <button
            type="button"
            onClick={() => navigate(`/flights/${flightNumber}/crew`)}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back to crew assignment
          </button>
        </div>
      </div>

      {/* Status messages */}
      {(error || info) && (
        <div className="space-y-1">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
              {info}
            </p>
          )}
        </div>
      )}

      {/* Auto-assign button */}
      <button
        type="button"
        onClick={handleAutoAssign}
        disabled={saving}
        className="inline-flex items-center rounded-md bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
      >
        {saving ? "Working..." : "Auto-Assign Seats (Backend)"}
      </button>

      {/* Table container */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        {passengers.length === 0 ? (
          <p className="text-sm text-slate-500">
            No passengers found for this flight.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Age</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Nationality
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Seat Class
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Seat Number
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Infant Parent Info
                  </th>
                </tr>
              </thead>

              <tbody>
                {passengers.map((p) => {
                  const missingSeat = !p.isInfant && !p.seatNumber;
                  const options = getSeatOptionsForPassenger(p.seatNumber);

                  return (
                    <tr
                      key={p.id}
                      className={
                        missingSeat
                          ? "bg-red-50 border-t border-red-200"
                          : "border-t border-slate-200"
                      }
                    >
                      <td className="px-4 py-2">
                        {p.name}
                        {p.isInfant && (
                          <span className="ml-2 text-[11px] rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
                            Infant (0–2)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-2">{p.age}</td>
                      <td className="px-4 py-2">{p.nationality}</td>
                      <td className="px-4 py-2">{p.seatType}</td>

                      <td className="px-4 py-2">
                        {p.isInfant ? (
                          <span className="text-xs text-slate-500">
                            No seat (Infant)
                          </span>
                        ) : (
                          <select
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={p.seatNumber || ""}
                            onChange={(e) =>
                              handleSeatChange(p.id, e.target.value)
                            }
                          >
                            <option value="">-- No seat --</option>
                            {options.map((seat) => (
                              <option key={seat} value={seat}>
                                {seat}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* LOCKED parent info (no dropdown) */}
                      <td className="px-4 py-2">
                        {p.isInfant ? (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                            {getInfantParentLabel(p.id)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p className="mt-2 text-xs text-slate-500">
              * Infants (0–2) cannot have seats. Parent info is auto-selected
              and locked (stored locally for demo).
            </p>
          </div>
        )}
      </div>

      {/* Save button + forward navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center rounded-md bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
          >
            Go to dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
