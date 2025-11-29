// src/pages/Roster/PlaneSeatMapPage.jsx
import { useState, useMemo } from "react";

const ROW_COUNT = 15;
const SEAT_LETTERS = ["A", "B", "C", "D"];

// basic layout: rows 1–3 business, 4–15 economy
// some seats are crew, some passengers, some infants, some empty
function buildInitialSeatMap() {
  const specialSeats = {
    "1A": { occupantType: "crew" },
    "1B": { occupantType: "crew" },
    "1C": { occupantType: "crew" },
    "1D": { occupantType: "crew" },
    "3C": { occupantType: "infant" },
    "4D": { occupantType: "infant" },
    "5A": { occupantType: "passenger" },
    "5B": { occupantType: "passenger" },
    "6C": { occupantType: "passenger" },
    "7D": { occupantType: "passenger" },
  };

  const rows = [];
  for (let r = 1; r <= ROW_COUNT; r++) {
    const cabinClass = r <= 3 ? "business" : "economy";
    const seats = SEAT_LETTERS.map((letter) => {
      const key = `${r}${letter}`;
      const special = specialSeats[key] || {};
      return {
        id: key,
        row: r,
        column: letter,
        cabinClass,
        occupantType: special.occupantType || null, // crew, passenger, infant, or null
      };
    });
    rows.push({ rowNumber: r, seats });
  }
  return rows;
}

const INITIAL_SEAT_MAP = buildInitialSeatMap();

export default function PlaneSeatMapPage() {
  const [filter, setFilter] = useState("all"); // all | crew | passengers

  const filteredSeatMap = useMemo(() => {
    if (filter === "all") return INITIAL_SEAT_MAP;

    return INITIAL_SEAT_MAP.map((row) => ({
      ...row,
      seats: row.seats.filter((seat) => {
        if (!seat.occupantType) return false; // hide empty when filtering
        if (filter === "crew") return seat.occupantType === "crew";
        if (filter === "passengers")
          return (
            seat.occupantType === "passenger" ||
            seat.occupantType === "infant"
          );
        return true;
      }),
    }));
  }, [filter]);

  const handleFilterChange = (e) => setFilter(e.target.value);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">
        Aircraft Seat Map
      </h2>

      <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: filters + legend */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-6">
          {/* Filter options */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Filter Options
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="filter"
                  value="all"
                  className="h-4 w-4"
                  checked={filter === "all"}
                  onChange={handleFilterChange}
                />
                <span>Show All</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="filter"
                  value="crew"
                  className="h-4 w-4"
                  checked={filter === "crew"}
                  onChange={handleFilterChange}
                />
                <span>Show Only Crew</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="filter"
                  value="passengers"
                  className="h-4 w-4"
                  checked={filter === "passengers"}
                  onChange={handleFilterChange}
                />
                <span>Show Passengers</span>
              </label>
            </div>
          </div>

          {/* Legend */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Legend
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              <LegendItem colorClass="bg-blue-500" label="Crew" />
              <LegendItem colorClass="bg-cyan-500" label="Business Class" />
              <LegendItem colorClass="bg-green-500" label="Economy Class" />
              <LegendItem colorClass="bg-red-400" label="Infant" />
              <LegendItem
                colorClass="bg-slate-300 border border-slate-400 text-slate-700"
                label="Empty Seat"
              />
            </div>
          </div>
        </div>

        {/* Right columns: seat layout */}
        <div className="md:col-span-2 border border-slate-200 rounded-lg p-4 flex flex-col items-center gap-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Aircraft Seat Layout
          </h3>

          {/* Front label */}
          <div className="px-6 py-2 rounded-md bg-slate-400 text-white text-sm font-medium">
            Front
          </div>

          {/* Seats */}
          <div className="flex gap-14">
            {/* Left block (A,B) */}
            <SeatColumnBlock side="left" seatMap={filteredSeatMap} />

            {/* Right block (C,D) */}
            <SeatColumnBlock side="right" seatMap={filteredSeatMap} />
          </div>

          {/* Rear label */}
          <div className="px-6 py-2 rounded-md bg-slate-400 text-white text-sm font-medium">
            Rear
          </div>
        </div>
      </div>
    </div>
  );
}

// small helper components

function LegendItem({ colorClass, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-4 w-4 rounded-sm shadow-sm ${colorClass}`}
      ></div>
      <span>{label}</span>
    </div>
  );
}

function SeatColumnBlock({ side, seatMap }) {
  // left side: A,B ; right side: C,D
  const letters = side === "left" ? ["A", "B"] : ["C", "D"];

  return (
    <div className="flex flex-col gap-1">
      {seatMap.map((row) => {
        const rowSeats = row.seats.filter((s) =>
          letters.includes(s.column)
        );
        if (rowSeats.length === 0) return null;

        return (
          <div
            key={row.rowNumber + side}
            className="flex items-center gap-2"
          >
            {side === "left" && (
              <span className="w-4 text-xs text-slate-500">
                {row.rowNumber}
              </span>
            )}
            <div className="flex gap-2">
              {letters.map((letter) => {
                const seat = rowSeats.find(
                  (s) => s.column === letter
                );
                if (!seat) {
                  // if filtering hid it, render placeholder with transparent seat
                  return (
                    <div key={letter} className="w-8 h-10" />
                  );
                }
                return (
                  <Seat key={seat.id} seat={seat} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Seat({ seat }) {
  const colorClass = getSeatColor(seat);

  return (
    <div
      className={`w-8 h-10 rounded-sm shadow-sm flex items-center justify-center text-xs font-semibold text-white ${colorClass}`}
    >
      {seat.column}
    </div>
  );
}

function getSeatColor(seat) {
  if (!seat.occupantType) {
    return "bg-slate-300 text-slate-700";
  }
  if (seat.occupantType === "crew") {
    return "bg-blue-500";
  }
  if (seat.occupantType === "infant") {
    return "bg-red-400";
  }
  if (seat.cabinClass === "business") {
    return "bg-cyan-500";
  }
  if (seat.cabinClass === "economy") {
    return "bg-green-500";
  }
  return "bg-slate-300 text-slate-700";
}
