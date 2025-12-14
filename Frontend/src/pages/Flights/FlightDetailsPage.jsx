// src/pages/Flights/FlightDetailsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api";

function formatDate(isoString) {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function formatTime(isoString) {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function FlightDetailsPage() {
  const { flightNumber } = useParams(); // from /flights/:flightNumber
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/flight/${flightNumber}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch flight (${res.status})`);
        }
        const json = await res.json();
        setFlight(json.data);
      } catch (err) {
        console.error("Error loading flight:", err);
        setError(err.message || "Could not load flight details.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [flightNumber]);

  const handleBack = () => {
    navigate("/flights");
  };

  const handleAssignCrew = () => {
    navigate(`/flights/${flightNumber}/crew`);
  };

  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Loading flight details...</p>;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-red-500">{error}</p>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Flights
        </button>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-500">Flight not found.</p>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Flights
        </button>
      </div>
    );
  }

  const date = formatDate(flight.flight_date);
  const time = formatTime(flight.flight_date);

  const source = flight.source || {};
  const destination = flight.destination || {};
  const vehicle = flight.vehicle_type || {};
  const connecting = flight.connecting_flight_info || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Flight Details
          </h2>
          <p className="text-sm text-slate-600">
            Flight Number:{" "}
            <span className="font-semibold">{flight.flight_number}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAssignCrew}
            className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            Assign Crew
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Back to Flights
          </button>
        </div>
      </div>

      {/* Main info grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic info */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="text-base font-semibold text-slate-900">
            Basic Flight Information
          </h3>
          <InfoRow label="Date" value={date} />
          <InfoRow label="Time" value={time} />
          <InfoRow
            label="Duration"
            value={flight.duration_minutes ? `${flight.duration_minutes} minutes` : "N/A"}
          />
          <InfoRow
            label="Distance"
            value={
              flight.distance_km != null
                ? `${Number(flight.distance_km)} km`
                : "N/A"
            }
          />
          <InfoRow
            label="Created At"
            value={flight.created_at ? formatDate(flight.created_at) : "N/A"}
          />
          <InfoRow
            label="Last Updated"
            value={flight.updated_at ? formatDate(flight.updated_at) : "N/A"}
          />
        </section>

        {/* Route info */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="text-base font-semibold text-slate-900">
            Route Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Source */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-1">
                Source
              </h4>
              <InfoRow label="Country" value={source.country || "N/A"} />
              <InfoRow label="City" value={source.city || "N/A"} />
              <InfoRow label="Airport" value={source.airport_name || "N/A"} />
              <InfoRow
                label="Code"
                value={source.airport_code || source.code || "N/A"}
              />
            </div>

            {/* Destination */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-1">
                Destination
              </h4>
              <InfoRow label="Country" value={destination.country || "N/A"} />
              <InfoRow label="City" value={destination.city || "N/A"} />
              <InfoRow
                label="Airport"
                value={destination.airport_name || "N/A"}
              />
              <InfoRow
                label="Code"
                value={destination.airport_code || destination.code || "N/A"}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Vehicle type & capacity */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="text-base font-semibold text-slate-900">
          Vehicle Type & Capacity
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoRow label="Type Name" value={vehicle.type_name || "N/A"} />
          <InfoRow
            label="Total Seats"
            value={
              vehicle.total_seats != null ? String(vehicle.total_seats) : "N/A"
            }
          />
          <InfoRow
            label="Max Crew"
            value={vehicle.max_crew != null ? String(vehicle.max_crew) : "N/A"}
          />
          <InfoRow
            label="Max Passengers"
            value={
              vehicle.max_passengers != null
                ? String(vehicle.max_passengers)
                : "N/A"
            }
          />
        </div>

        <div className="mt-2">
          <h4 className="text-sm font-semibold text-slate-800 mb-1">
            Standard Menu
          </h4>
          <p className="text-sm text-slate-700">
            {vehicle.menu_description || "No menu description available."}
          </p>
        </div>
      </section>

      {/* Shared flight info */}
      {flight.is_shared && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="text-base font-semibold text-slate-900">
            Shared Flight Information
          </h3>
          <InfoRow
            label="Shared Flight Number"
            value={flight.shared_flight_number || "N/A"}
          />
          <InfoRow
            label="Shared Airline"
            value={flight.shared_airline_name || "N/A"}
          />
        </section>
      )}

      {/* Connecting flight info */}
      {connecting && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="text-base font-semibold text-slate-900">
            Connecting Flight Information
          </h3>
          <InfoRow
            label="Connecting Flight Number"
            value={connecting.connecting_flight_number || "N/A"}
          />
          <InfoRow
            label="Connecting Airline"
            value={connecting.connecting_airline || "N/A"}
          />
          <InfoRow
            label="Connection Airport"
            value={connecting.connection_airport || "N/A"}
          />
          <InfoRow
            label="Layover"
            value={
              connecting.layover_minutes != null
                ? `${connecting.layover_minutes} minutes`
                : "N/A"
            }
          />
        </section>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right break-words">
        {value}
      </span>
    </div>
  );
}
