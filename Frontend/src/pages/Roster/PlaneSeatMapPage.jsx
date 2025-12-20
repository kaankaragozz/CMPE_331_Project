// src/pages/Roster/PlaneSeatMapPage.jsx
import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ROW_COUNT = 15;
const SEAT_LETTERS = ["A", "B", "C", "D"];

const PASSENGER_API_BASE = "http://localhost:3004";

const TOOLTIP_OFFSET_X = 0;   // left/right
const TOOLTIP_OFFSET_Y = 14;  // distance ABOVE the cursor (bigger = higher)

// basic layout: rows 1–3 business, 4–15 economy
// some seats are crew (static demo), passengers/infants come from DB
function buildBaseSeatMap() {
  const specialSeats = {
    "1A": { occupantType: "crew", occupantName: "Crew Seat" },
    "1B": { occupantType: "crew", occupantName: "Crew Seat" },
    "1C": { occupantType: "crew", occupantName: "Crew Seat" },
    "1D": { occupantType: "crew", occupantName: "Crew Seat" },
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
        occupantName: special.occupantName || "",   // name to show on hover
      };
    });
    rows.push({ rowNumber: r, seats });
  }
  return rows;
}

export default function PlaneSeatMapPage() {
  const { flightNumber } = useParams(); // /flights/:flightNumber/seat-map
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all"); // all | crew | passengers
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseSeatMap = useMemo(() => buildBaseSeatMap(), []);

  // ---------- Fetch passenger seat data from Passenger-Service ----------
  const fetchPassengers = useCallback(async () => {
    if (!flightNumber) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${PASSENGER_API_BASE}/api/passengers/flight/${flightNumber}`
      );

      const payload = res.data?.data || [];
      setPassengers(payload);
    } catch (err) {
      console.error("PlaneSeatMapPage: error fetching seat map data", err);
      setError(err.response?.data?.message || "Failed to load seat map data.");
    } finally {
      setLoading(false);
    }
  }, [flightNumber]);

  useEffect(() => {
    fetchPassengers();
  }, [fetchPassengers]);

  // ---------- Build seat map with DB overlay ----------
  const seatMap = useMemo(() => {
    // deep-clone base map so we can safely mutate
    const rows = baseSeatMap.map((row) => ({
      ...row,
      seats: row.seats.map((seat) => ({ ...seat })),
    }));

    const seatIndex = new Map();
    rows.forEach((row) =>
      row.seats.forEach((seat) => {
        seatIndex.set(seat.id, seat);
      })
    );

    // Overlay passengers from DB
    passengers.forEach((p) => {
      if (!p.seat_number) return; // unassigned passenger
      const seatKey = p.seat_number; // e.g. "5A"
      const seat = seatIndex.get(seatKey);
      if (!seat) return;

      // ✅ passengers must NOT overwrite crew seats
      if (seat.occupantType === "crew") return;

      seat.occupantType = p.is_infant ? "infant" : "passenger";
      seat.occupantName = p.name || (p.is_infant ? "Infant" : "Passenger");

      // keep cabinClass aligned with DB if provided
      if (p.seat_class) {
        const cls = p.seat_class.toLowerCase();
        if (cls.includes("business")) seat.cabinClass = "business";
        else if (cls.includes("economy")) seat.cabinClass = "economy";
      }
    });

    return rows;
  }, [baseSeatMap, passengers]);

  // ---------- Filtering ----------
  const filteredSeatMap = useMemo(() => {
    if (filter === "all") return seatMap;

    return seatMap.map((row) => ({
      ...row,
      seats: row.seats.filter((seat) => {
        if (!seat.occupantType) return false; // hide empty when filtering
        if (filter === "crew") return seat.occupantType === "crew";
        if (filter === "passengers")
          return seat.occupantType === "passenger" || seat.occupantType === "infant";
        return true;
      }),
    }));
  }, [filter, seatMap]);

  const handleFilterChange = (e) => setFilter(e.target.value);

  // ---------- Navigation handlers ----------
  const goDashboard = () => navigate("/");
  const goFlights = () => navigate("/flights");
  const goFlightDetails = () => navigate(`/flights/${flightNumber}`);
  const goSeatAssignment = () => navigate(`/flights/${flightNumber}/passengers`);

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="p-4 text-sm text-slate-600">
        Loading seat map for <span className="font-mono">{flightNumber}</span>...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
        <button
          onClick={goFlights}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to flights
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + nav buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Aircraft Seat Map – Flight {flightNumber}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Hover a seat to see who is sitting there.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={goDashboard}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
          >
            Back to dashboard
          </button>
          <button
            onClick={goFlights}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
          >
            Back to flights
          </button>
          <button
            onClick={goFlightDetails}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-indigo-700"
          >
            Flight details
          </button>
          <button
            onClick={goSeatAssignment}
            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-emerald-700"
          >
            Seat assignment
          </button>
        </div>
      </div>

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
                <span>Show Passengers & Infants</span>
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
              <LegendItem colorClass="bg-cyan-500" label="Business Passenger" />
              <LegendItem colorClass="bg-green-500" label="Economy Passenger" />
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

// ---------------- helpers / components ----------------

function LegendItem({ colorClass, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-4 w-4 rounded-sm shadow-sm ${colorClass}`} />
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
        const rowSeats = row.seats.filter((s) => letters.includes(s.column));
        if (rowSeats.length === 0) return null;

        return (
          <div key={row.rowNumber + side} className="flex items-center gap-2">
            {side === "left" && (
              <span className="w-4 text-xs text-slate-500">{row.rowNumber}</span>
            )}

            <div className="flex gap-2">
              {letters.map((letter) => {
                const seat = rowSeats.find((s) => s.column === letter);
                if (!seat) return <div key={letter} className="w-8 h-10" />;
                return <Seat key={seat.id} seat={seat} />;
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
  const badge = getBadge(seat);

  // Start as null so we never render tooltip at (0,0) -> no corner “fly-in”
  const [pos, setPos] = useState(null);

  const updatePos = (e) => {
    setPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="relative"
      onMouseEnter={updatePos}
      onMouseMove={updatePos}
      onMouseLeave={() => setPos(null)}
    >
      <div
        className={[
          "w-8 h-10 rounded-sm shadow-sm flex items-center justify-center text-xs font-semibold text-white",
          colorClass,
          "cursor-pointer select-none",
          "transition-transform duration-150 ease-out hover:scale-[1.06]",
          "hover:ring-2 hover:ring-slate-900/20",
        ].join(" ")}
      >
        {seat.column}
      </div>

      {/* Tooltip (no animation; fixed position above cursor) */}
      {pos && (
        <div
          className="pointer-events-none fixed z-50 opacity-100"
          style={{
            left: pos.x + TOOLTIP_OFFSET_X,
            top: pos.y - TOOLTIP_OFFSET_Y,
            transform: "translate(-50%, -100%)", // center above cursor
          }}
        >
          <div className="rounded-lg border border-slate-200 bg-white shadow-lg px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-900">{seat.id}</div>
              {badge}
            </div>

            <div className="mt-1 text-sm font-medium text-slate-800 truncate max-w-[220px]">
              {getDisplayName(seat)}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {seat.occupantType === "crew"
                ? "Reserved crew seat"
                : seat.occupantType
                ? `Class: ${seat.cabinClass}`
                : "Empty seat"}
            </div>
          </div>

          <div className="mx-auto h-2 w-2 rotate-45 bg-white border-b border-r border-slate-200 -mt-1" />
        </div>
      )}
    </div>
  );
}

function getDisplayName(seat) {
  if (!seat.occupantType) return "Empty";
  if (seat.occupantType === "crew") return seat.occupantName || "Crew";
  if (seat.occupantType === "infant") return seat.occupantName ? `${seat.occupantName} (Infant)` : "Infant";
  return seat.occupantName || "Passenger";
}

function getBadge(seat) {
  if (!seat.occupantType) return null;

  const base =
    "text-[10px] rounded-full border px-2 py-0.5 font-semibold whitespace-nowrap";

  if (seat.occupantType === "crew") {
    return <span className={`${base} border-blue-200 bg-blue-50 text-blue-700`}>Crew</span>;
  }
  if (seat.occupantType === "infant") {
    return <span className={`${base} border-red-200 bg-red-50 text-red-700`}>Infant</span>;
  }
  if (seat.cabinClass === "business") {
    return <span className={`${base} border-cyan-200 bg-cyan-50 text-cyan-700`}>Business</span>;
  }
  return <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}>Economy</span>;
}

function getSeatColor(seat) {
  if (!seat.occupantType) return "bg-slate-300 text-slate-700";
  if (seat.occupantType === "crew") return "bg-blue-500";
  if (seat.occupantType === "infant") return "bg-red-400";
  if (seat.cabinClass === "business") return "bg-cyan-500";
  if (seat.cabinClass === "economy") return "bg-green-500";
  return "bg-slate-300 text-slate-700";
}
