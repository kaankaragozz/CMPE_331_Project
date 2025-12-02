// src/pages/Passengers/PassengerSeatAssignmentPage.jsx
import { useMemo, useState } from "react";

const INITIAL_PASSENGERS = [
  { id: "12345", name: "John Doe", seatType: "Window", seatNumber: "A1" },
  { id: "67890", name: "Jane Smith", seatType: "Aisle", seatNumber: "" },
  { id: "11223", name: "Peter Jones", seatType: "Middle", seatNumber: "C3" },
  { id: "44556", name: "Alice Brown", seatType: "Window", seatNumber: "" },
];

// simple demo seat map
const SEAT_OPTIONS = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];

export default function PassengerSeatAssignmentPage() {
  const [passengers, setPassengers] = useState(INITIAL_PASSENGERS);

  // seats already chosen
  const assignedSeats = useMemo(
    () => new Set(passengers.map((p) => p.seatNumber).filter(Boolean)),
    [passengers]
  );

  const getSeatOptionsForPassenger = (currentSeat) => {
    return SEAT_OPTIONS.filter(
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

  const handleAutoAssign = () => {
    setPassengers((prev) => {
      const taken = new Set(prev.map((p) => p.seatNumber).filter(Boolean));
      const newPassengers = prev.map((p) => ({ ...p }));
      for (const p of newPassengers) {
        if (!p.seatNumber) {
          const freeSeat = SEAT_OPTIONS.find((s) => !taken.has(s));
          if (freeSeat) {
            p.seatNumber = freeSeat;
            taken.add(freeSeat);
          }
        }
      }
      return newPassengers;
    });
  };

  const handleSave = () => {
    console.log("Saving passenger seat assignments:", passengers);
    alert("Seat assignments saved (check console for payload).");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">
        Passenger Information and Seat Assignment
      </h2>

      {/* Auto-assign button */}
      <button
        type="button"
        onClick={handleAutoAssign}
        className="inline-flex items-center rounded-md bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        Auto-Assign Seats
      </button>

      {/* Table container */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Seat Type
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
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        className="inline-flex items-center rounded-md bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600"
      >
        Save Assignments
      </button>
    </div>
  );
}
