// src/pages/Roster/PlaneSeatMapPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ROW_COUNT = 15;
const SEAT_LETTERS = ["A", "B", "C", "D"];

// Crew seats reserved (passengers must NOT sit here)
const CREW_SEATS = ["1A", "1B", "1C", "1D"];
const CREW_SEAT_SET = new Set(CREW_SEATS);

const PASSENGER_API_BASE = "http://localhost:3004";

// basic layout: rows 1–3 business, 4–15 economy
// some seats are crew (static demo), passengers/infants come from DB
function buildBaseSeatMap() {
  const specialSeats = {};
  CREW_SEATS.forEach((s) => (specialSeats[s] = { occupantType: "crew" }));

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

export default function PlaneSeatMapPage() {
  const { flightNumber } = useParams(); // /flights/:flightNumber/seat-map
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all"); // all | crew | passengers
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseSeatMap = useMemo(() => buildBaseSeatMap(), []);

  // ---------- Fetch passenger seat data from Passenger-Service ----------
  useEffect(() => {
    if (!flightNumber) return;

    const fetchPassengers = async () => {
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
        setError(
          err.response?.data?.message || "Failed to load seat map data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPassengers();
  }, [flightNumber]);

  // ---------- Build seat map with DB overlay ----------
  const seatMap = useMemo(() => {
    // deep-clone base map so we can mutate it safely
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
      if (!seat) return; // seat not in our simple layout

      // IMPORTANT: Never allow DB overlay to overwrite crew seats
      if (CREW_SEAT_SET.has(seatKey)) return;

      seat.occupantType = p.is_infant ? "infant" : "passenger";

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
          return (
            seat.occupantType === "passenger" ||
            seat.occupantType === "infant"
          );
        return true;
      }),
    }));
  }, [filter, seatMap]);

  const handleFilterChange = (e) => setFilter(e.target.value);

  // ---------- Navigation handlers ----------
  const goDashboard = () => navigate("/");
  const goFlights = () => navigate("/flights");
  const goFlightDetails = () => navigate(`/flights/${flightNumber}`);
  const goSeatAssignment = () =>
    navigate(`/flights/${flightNumber}/passengers`);

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="p-4 text-sm text-slate-600">
        Loading seat map for{" "}
        <span className="font-mono">{flightNumber}</span>...
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
            Visual map of occupied and empty seats based on passenger assignments
            in the database. Crew seats are reserved and cannot be taken by passengers.
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
              <LegendItem colorClass="bg-blue-500" label="Crew (Reserved)" />
              <LegendItem colorClass="bg-cyan-500" label="Business Passenger" />
              <LegendItem colorClass="bg-green-500" label="Economy Passenger" />
              <LegendItem colorClass="bg-red-400" label="Infant" />
              <LegendItem
                colorClass="bg-slate-300 border border-slate-400 text-slate-700"
                label="Empty Seat"
              />
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Reserved crew seats:{" "}
              <span className="font-mono">{CREW_SEATS.join(", ")}</span>
            </p>
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
      <div className={`h-4 w-4 rounded-sm shadow-sm ${colorClass}`}></div>
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
              <span className="w-4 text-xs text-slate-500">
                {row.rowNumber}
              </span>
            )}
            <div className="flex gap-2">
              {letters.map((letter) => {
                const seat = rowSeats.find((s) => s.column === letter);
                if (!seat) {
                  // if filtering hid it, render placeholder with transparent seat
                  return <div key={letter} className="w-8 h-10" />;
                }
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

  return (
    <div
      className={`w-8 h-10 rounded-sm shadow-sm flex items-center justify-center text-xs font-semibold text-white ${colorClass}`}
      title={seat.id}
    >
      {seat.column}
    </div>
  );
}

function getSeatColor(seat) {
  if (!seat.occupantType) return "bg-slate-300 text-slate-700";
  if (seat.occupantType === "crew") return "bg-blue-500";
  if (seat.occupantType === "infant") return "bg-red-400";
  if (seat.cabinClass === "business") return "bg-cyan-500";
  if (seat.cabinClass === "economy") return "bg-green-500";
  return "bg-slate-300 text-slate-700";
}
