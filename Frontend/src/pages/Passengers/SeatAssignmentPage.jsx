// src/pages/Passengers/SeatAssignmentPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api";

// Fallback seat options in case auto-assign endpoint fails
const DEFAULT_SEAT_OPTIONS = [
  "1A", "1B", "1C",
  "2A", "2B", "2C",
  "3A", "3B", "3C",
  "4A", "4B", "4C",
  "5A", "5B", "5C",
];

export default function PassengerSeatAssignmentPage() {
  const params = useParams();
  const navigate = useNavigate();

  // Accept different param naming just in case
  const flightNumber =
    params.flightNumber || params.id || params.flightId || "";

  const [flightInfo, setFlightInfo] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [seatOptions, setSeatOptions] = useState(DEFAULT_SEAT_OPTIONS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // seats already chosen
  const assignedSeats = useMemo(
    () => new Set(passengers.map((p) => p.seatNumber).filter(Boolean)),
    [passengers]
  );

  const getSeatOptionsForPassenger = (currentSeat) => {
    return seatOptions.filter(
      (seat) => !assignedSeats.has(seat) || seat === currentSeat
    );
  };

  const handleSeatChange = (id, seat) => {
    setPassengers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, seatNumber: seat === "" ? "" : seat } : p
      )
    );
  };

  const handleAutoAssign = async () => {
    if (!flightNumber) return;

    setError("");
    setSuccessMessage("");

    try {
      // Use backend auto-assign logic first
      const res = await fetch(
        `${API_BASE_URL}/passengers/flight/${flightNumber}/assign-seats`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.warn("Auto-assign backend failed:", text);

        // Fallback: front-end greedy auto-assign using DEFAULT_SEAT_OPTIONS
        setPassengers((prev) => {
          const taken = new Set(prev.map((p) => p.seatNumber).filter(Boolean));
          const newPassengers = prev.map((p) => ({ ...p }));

          for (const p of newPassengers) {
            if (!p.seatNumber) {
              const freeSeat = seatOptions.find((s) => !taken.has(s));
              if (freeSeat) {
                p.seatNumber = freeSeat;
                taken.add(freeSeat);
              }
            }
          }

          return newPassengers;
        });

        setError(
          "Backend auto-assign failed, used simple local auto-assignment instead."
        );
        return;
      }

      // If backend auto-assign worked, reload passengers from DB
      await fetchPassengers();
      setSuccessMessage("Seats auto-assigned successfully.");
    } catch (err) {
      console.error("Auto-assign error:", err);
      setError(
        "Auto-assign failed. You can assign seats manually and click Save."
      );
    }
  };

  const handleSave = async () => {
    if (!flightNumber) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      // Save seat for each passenger that has a seatNumber
      const toSave = passengers.filter((p) => p.seatNumber);

      await Promise.all(
        toSave.map((p) =>
          fetch(
            `${API_BASE_URL}/passengers/flight/${flightNumber}/manual-assign`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                passenger_id: p.id,
                seat_number: p.seatNumber,
              }),
            }
          ).then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(
                `Failed for passenger ${p.id} (${res.status}): ${text}`
              );
            }
          })
        )
      );

      setSuccessMessage("Seat assignments saved successfully.");
    } catch (err) {
      console.error("Save assignments error:", err);
      setError(err.message || "Failed to save seat assignments.");
    } finally {
      setSaving(false);
    }
  };

  const handleBackToFlights = () => {
    navigate("/flights");
  };

  // helper so auto-assign can refetch
  const fetchPassengers = async () => {
    if (!flightNumber) return;

    // 1) load passengers for this flight
    const passengersRes = await fetch(
      `${API_BASE_URL}/passengers/flight/${flightNumber}`
    );
    if (!passengersRes.ok) {
      const text = await passengersRes.text();
      throw new Error(
        `Failed to load passengers (${passengersRes.status}): ${text}`
      );
    }

    const passengersJson = await passengersRes.json();
    const passengersRaw = passengersJson.data || passengersJson || [];

    const mappedPassengers = passengersRaw.map((p, idx) => ({
      id: p.passenger_id ?? p.id ?? idx,
      name: p.name || `Passenger ${idx + 1}`,
      seatType: p.seat_class || "",
      seatNumber: p.seat_number || "",
    }));

    setPassengers(mappedPassengers);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!flightNumber) {
        setError("No flight number in URL. Check your route definition.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        // 1) Flight info (for header; uses /api/flight controller)
        const flightRes = await fetch(
          `${API_BASE_URL}/flight/${flightNumber}`
        );
        if (flightRes.ok) {
          const flightJson = await flightRes.json();
          const flight = flightJson.data || flightJson;
          setFlightInfo(flight);

          // optional: if seating_plan exists, derive options from it
          if (flight?.vehicle_type?.seating_plan?.seats) {
            setSeatOptions(flight.vehicle_type.seating_plan.seats);
          }
        }

        // 2) Passengers
        await fetchPassengers();
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load passenger data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightNumber]);

  const headerTitle = flightInfo
    ? `Passenger Information – Flight ${flightInfo.flight_number || flightNumber}`
    : "Passenger Information and Seat Assignment";

  return (
    <div className="space-y-4">
      {/* header + back button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {headerTitle}
          </h2>
          {flightInfo && (
            <p className="text-sm text-slate-500 mt-1">
              {flightInfo.source?.airport_code || flightInfo.source?.code || "??"}{" "}
              →{" "}
              {flightInfo.destination?.airport_code ||
                flightInfo.destination?.code ||
                "??"}{" "}
              • {flightInfo.vehicle_type?.type_name || "Unknown aircraft"}
            </p>
          )}
          {loading && (
            <p className="text-xs text-slate-400 mt-1">
              Loading passenger data...
            </p>
          )}
          {error && (
            <p className="text-xs text-red-500 mt-1">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-xs text-emerald-600 mt-1">
              {successMessage}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleBackToFlights}
          className="inline-flex items-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Flights
        </button>
      </div>

      {/* Auto-assign button */}
      <button
        type="button"
        onClick={handleAutoAssign}
        className="inline-flex items-center rounded-md bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-70"
        disabled={loading || passengers.length === 0}
      >
        Auto-Assign Seats
      </button>

      {/* Table container */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        {passengers.length === 0 && !loading ? (
          <p className="text-sm text-slate-500">
            No passengers found for this flight.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">ID</th>
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
                  return (
                    <tr
                      key={p.id}
                      className={
                        missingSeat
                          ? "bg-red-100 border-t border-red-200"
                          : "border-t border-slate-200"
                      }
                    >
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.id}</td>
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
                            -- Select Seat --
                          </option>
                          {getSeatOptionsForPassenger(p.seatNumber).map(
                            (seat) => (
                              <option key={seat} value={seat}>
                                {seat}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || passengers.length === 0}
        className="inline-flex items-center rounded-md bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-70"
      >
        {saving ? "Saving..." : "Save Assignments"}
      </button>
    </div>
  );
}
