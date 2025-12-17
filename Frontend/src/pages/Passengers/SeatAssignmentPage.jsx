// src/pages/Passengers/PassengerSeatAssignmentPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Simple seat map configuration
const ROWS = 30; // adjust for your aircraft if needed
const SEAT_LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function PassengerSeatAssignmentPage() {
  const { flightNumber } = useParams(); // /flights/:flightNumber/passengers
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const [passengers, setPassengers] = useState([]);
  const [originalPassengers, setOriginalPassengers] = useState([]);

  // All possible seat numbers (1A..1F, 2A..2F, ..., 30A..30F)
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
    setError(null);
    setInfo(null);

    try {
      const res = await axios.get(
        `${API_BASE}/api/passengers/flight/${flightNumber}`
      );
      const data = res.data?.data || [];

      const mapped = data.map((p) => ({
        id: p.passenger_id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        nationality: p.nationality,
        seatType: p.seat_class || "N/A",
        seatNumber: p.seat_number || "",
        isInfant: p.is_infant || false,
      }));

      setPassengers(mapped);
      setOriginalPassengers(mapped);
    } catch (err) {
      console.error("Error loading passengers:", err);
      setError("Failed to load passengers for this flight.");
    } finally {
      setLoading(false);
    }
  }, [flightNumber]);

  useEffect(() => {
    loadPassengers();
  }, [loadPassengers]);

  // Seats already chosen (by current state)
  const assignedSeats = useMemo(
    () => new Set(passengers.map((p) => p.seatNumber).filter(Boolean)),
    [passengers]
  );

  const handleSeatChange = (id, seat) => {
    setPassengers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, seatNumber: seat || "" } : p
      )
    );
  };

  // Seat options for a specific passenger:
  // - All seats that are not currently taken by someone else
  // - Plus the passenger's current seat (to avoid it disappearing)
  const getSeatOptionsForPassenger = (currentSeat) => {
    return ALL_SEATS.filter(
      (seat) => !assignedSeats.has(seat) || seat === currentSeat
    );
  };

  // ---- BACKEND AUTO ASSIGN ----
  const handleAutoAssign = async () => {
    if (!flightNumber) return;
    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      const res = await axios.post(
        `${API_BASE}/api/passengers/flight/${flightNumber}/assign-seats`
      );

      setInfo(res.data?.message || "Auto-assigned seats successfully.");
      await loadPassengers(); // reload updated seats from DB
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

  // ---- SAVE MANUAL CHANGES ----
  const handleSave = async () => {
    if (!flightNumber) return;
    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      const originalById = {};
      originalPassengers.forEach((p) => {
        originalById[p.id] = p.seatNumber || "";
      });

      const changed = passengers.filter(
        (p) => (p.seatNumber || "") !== originalById[p.id]
      );

      const updates = changed.filter((p) => p.seatNumber);

      if (updates.length === 0) {
        setInfo("No seat changes to save.");
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

      setInfo("Seat assignments saved successfully.");
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
        <p className="text-sm text-slate-500">
          Loading passenger seat data...
        </p>
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
                  <th className="px-4 py-2 text-left font-semibold">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Age
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Nationality
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Seat Class
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Seat Number
                  </th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p) => {
                  const missingSeat = !p.seatNumber;
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
                            Infant
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">{p.age}</td>
                      <td className="px-4 py-2">{p.nationality}</td>
                      <td className="px-4 py-2">{p.seatType}</td>
                      <td className="px-4 py-2">
                        <select
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={p.seatNumber || ""}
                          onChange={(e) =>
                            handleSeatChange(p.id, e.target.value)
                          }
                        >
                          <option value="">
                            -- No seat --
                          </option>
                          {options.map((seat) => (
                            <option key={seat} value={seat}>
                              {seat}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-500">
              * Backend will still prevent assigning the same seat to two
              different passengers.
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
          {saving ? "Saving..." : "Save Assignments"}
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
