// src/pages/Roster/PlaneSeatMapPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api";

// fallback config if seating_plan is missing or malformed
const FALLBACK_ROW_COUNT = 15;
const FALLBACK_SEAT_LETTERS = ["A", "B", "C", "D"];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// build static map like your old one (used only if no seating_plan from DB)
function buildFallbackSeatMap() {
  const rows = [];
  for (let r = 1; r <= FALLBACK_ROW_COUNT; r++) {
    const cabinClass = r <= 3 ? "business" : "economy";
    const seats = FALLBACK_SEAT_LETTERS.map((letter) => ({
      id: `${r}${letter}`,
      row: r,
      column: letter,
      cabinClass,
      occupantType: null,
    }));
    rows.push({ rowNumber: r, seats });
  }
  return rows;
}

// build seat map using vehicle_types.seating_plan + passenger assignments
function buildSeatMapFromPlan(seatingPlan, passengers) {
  if (!seatingPlan || (!seatingPlan.business && !seatingPlan.economy)) {
    return buildFallbackSeatMap();
  }

  // map seat_number -> occupant info
  const seatOccupants = new Map();
  (passengers || []).forEach((p) => {
    if (!p.seat_number) return;
    const occupantType = p.is_infant ? "infant" : "passenger";
    seatOccupants.set(p.seat_number, {
      occupantType,
      name: p.name,
      seatClass: p.seat_class || null,
    });
  });

  const rows = [];
  let currentRow = 1;

  const buildCabin = (cabinConfig, cabinClass) => {
    if (!cabinConfig) return;
    const rowsCount = cabinConfig.rows || 0;
    const seatsPerRow = cabinConfig.seats_per_row || 4;

    for (let r = 0; r < rowsCount; r++) {
      const seats = [];
      for (let c = 0; c < seatsPerRow; c++) {
        const letter = LETTERS[c] || "?";
        const seatId = `${currentRow}${letter}`;
        const occ = seatOccupants.get(seatId);

        seats.push({
          id: seatId,
          row: currentRow,
          column: letter,
          cabinClass,
          occupantType: occ?.occupantType || null,
          occupantName: occ?.name || null,
        });
      }
      rows.push({
        rowNumber: currentRow,
        cabinClass,
        seats,
      });
      currentRow++;
    }
  };

  // business first, then economy, similar to your autoAssignSeats logic
  buildCabin(seatingPlan.business, "business");
  buildCabin(seatingPlan.economy, "economy");

  return rows;
}

export default function PlaneSeatMapPage() {
  const params = useParams();
  const navigate = useNavigate();
  const flightNumber =
    params.flightNumber || params.id || params.flightId || "";

  const [flightInfo, setFlightInfo] = useState(null);
  const [rawPassengers, setRawPassengers] = useState([]);
  const [seatMap, setSeatMap] = useState(buildFallbackSeatMap());

  const [filter, setFilter] = useState("all"); // all | crew | passengers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleBackToFlights = () => {
    navigate("/flights");
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

        // 1) flight info (for heading + seating_plan)
        const flightRes = await fetch(
          `${API_BASE_URL}/flight/${flightNumber}`
        );
        if (!flightRes.ok) {
          const text = await flightRes.text();
          throw new Error(
            `Failed to load flight (${flightRes.status}): ${text}`
          );
        }
        const flightJson = await flightRes.json();
        const flight = flightJson.data || flightJson;
        setFlightInfo(flight);

        // 2) passengers for this flight
        const paxRes = await fetch(
          `${API_BASE_URL}/passengers/flight/${flightNumber}`
        );
        if (!paxRes.ok) {
          const text = await paxRes.text();
          throw new Error(
            `Failed to load passengers (${paxRes.status}): ${text}`
          );
        }
        const paxJson = await paxRes.json();
        const passengers = paxJson.data || paxJson || [];
        setRawPassengers(passengers);

        // 3) build seat map from seating_plan + passengers
        const seatingPlan = flight?.vehicle_type?.seating_plan || null;
        const seatMapBuilt = buildSeatMapFromPlan(seatingPlan, passengers);
        setSeatMap(seatMapBuilt);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load seat map data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightNumber]);

  const headerTitle = flightInfo
    ? `Seat Map – Flight ${flightInfo.flight_number || flightNumber}`
    : "Aircraft Seat Map";

  return (
    <div className="space-y-6">
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
              Loading seat map...
            </p>
          )}
          {error && (
            <p className="text-xs text-red-500 mt-1">
              {error}
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
              <LegendItem colorClass="bg-red-400" label="Infant (on seat)" />
              <LegendItem
                colorClass="bg-slate-300 border border-slate-400 text-slate-700"
                label="Empty Seat"
              />
            </div>
          </div>

          {/* Quick stats */}
          <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
            <p>
              Total passengers:{" "}
              <span className="font-semibold">
                {rawPassengers.length}
              </span>
            </p>
            <p>
              With seats assigned:{" "}
              <span className="font-semibold">
                {rawPassengers.filter((p) => p.seat_number).length}
              </span>
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
      title={
        seat.occupantName
          ? `${seat.id} • ${seat.occupantName}`
          : seat.id
      }
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
