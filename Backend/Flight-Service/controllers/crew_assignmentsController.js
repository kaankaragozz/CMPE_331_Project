import { sql } from "../config/db.js";

// GET crew assignment for a flight (by flight_number)
export const getCrewAssignmentByFlightNumber = async (req, res) => {
  const { flight_number } = req.params;

  try {
    const flightRows = await sql`
      SELECT id 
      FROM flights 
      WHERE UPPER(flight_number) = UPPER(${flight_number})
    `;

    if (flightRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Flight with number ${flight_number} not found`,
      });
    }

    const flightId = flightRows[0].id;

    const assignmentRows = await sql`
      SELECT 
        flight_id,
        pilot_ids,
        cabin_crew_ids,
        created_at,
        updated_at
      FROM flight_crew_assignments
      WHERE flight_id = ${flightId}
      LIMIT 1
    `;

    if (assignmentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No crew assignment found for this flight",
      });
    }

    return res.status(200).json({
      success: true,
      data: assignmentRows[0],
    });
  } catch (error) {
    console.error("Error in getCrewAssignmentByFlightNumber:", error);
    return res.status(500).json({
      success: false,
      message: "Error loading crew assignment",
      error: error.message,
    });
  }
};

// POST/UPSERT crew assignment for a flight (by flight_number)
export const upsertCrewAssignmentForFlight = async (req, res) => {
  const { flight_number } = req.params;
  const { pilot_ids, cabin_crew_ids } = req.body;

  if (!Array.isArray(pilot_ids) || pilot_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "pilot_ids must be a non-empty array of IDs",
    });
  }

  if (!Array.isArray(cabin_crew_ids) || cabin_crew_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "cabin_crew_ids must be a non-empty array of IDs",
    });
  }

  try {
    const flightRows = await sql`
      SELECT id 
      FROM flights 
      WHERE UPPER(flight_number) = UPPER(${flight_number})
    `;

    if (flightRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Flight with number ${flight_number} not found`,
      });
    }

    const flightId = flightRows[0].id;

    const pilotIdsArray = `{${pilot_ids.join(",")}}`;
    const cabinCrewArray = `{${cabin_crew_ids.join(",")}}`;

    const result = await sql`
      INSERT INTO flight_crew_assignments (
        flight_id,
        pilot_ids,
        cabin_crew_ids
      )
      VALUES (
        ${flightId},
        ${pilotIdsArray}::int[],
        ${cabinCrewArray}::int[]
      )
      ON CONFLICT (flight_id) DO UPDATE SET
        pilot_ids = EXCLUDED.pilot_ids,
        cabin_crew_ids = EXCLUDED.cabin_crew_ids,
        updated_at = NOW()
      RETURNING *
    `;

    return res.status(200).json({
      success: true,
      message: "Crew assignment saved successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Error in upsertCrewAssignmentForFlight:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving crew assignment",
      error: error.message,
    });
  }
};

// 🔥 NEW: GET all flights assigned to a given pilot (by pilot_id)
export const getFlightsByPilotId = async (req, res) => {
  const { pilot_id } = req.params;

  if (!pilot_id) {
    return res.status(400).json({
      success: false,
      message: "pilot_id is required",
    });
  }

  try {
    const flights = await sql`
      SELECT 
        f.id,
        f.flight_number,
        f.flight_date,
        f.duration_minutes,
        f.distance_km,
        f.is_shared,
        f.shared_flight_number,
        f.shared_airline_name,
        f.connecting_flight_info,
        f.created_at,
        f.updated_at,
        json_build_object(
          'country', sa.country,
          'city', sa.city,
          'airport_name', sa.name,
          'airport_code', sa.code
        ) as source,
        json_build_object(
          'country', da.country,
          'city', da.city,
          'airport_name', da.name,
          'airport_code', da.code
        ) as destination,
        json_build_object(
          'id', vt.id,
          'type_name', vt.type_name,
          'total_seats', vt.total_seats,
          'seating_plan', vt.seating_plan,
          'max_crew', vt.max_crew,
          'max_passengers', vt.max_passengers,
          'menu_description', vt.menu_description
        ) as vehicle_type
      FROM flight_crew_assignments fca
      JOIN flights f ON fca.flight_id = f.id
      JOIN airports sa ON f.source_airport_id = sa.id
      JOIN airports da ON f.destination_airport_id = da.id
      JOIN vehicle_types vt ON f.vehicle_type_id = vt.id
      WHERE ${pilot_id} = ANY (fca.pilot_ids)
      ORDER BY f.flight_date ASC
    `;

    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error("Error in getFlightsByPilotId:", error);
    return res.status(500).json({
      success: false,
      message: "Error loading flights for pilot",
      error: error.message,
    });
  }
};

export const getFlightsByCrewId = async (req, res) => {
  const { crew_id } = req.params; // <-- match your route

  if (!crew_id) {
    return res.status(400).json({
      success: false,
      message: "crew_id is required",
    });
  }

  try {
    const flights = await sql`
      SELECT 
        f.id,
        f.flight_number,
        f.flight_date,
        f.duration_minutes,
        f.distance_km,
        f.is_shared,
        f.shared_flight_number,
        f.shared_airline_name,
        f.connecting_flight_info,
        f.created_at,
        f.updated_at,
        json_build_object(
          'country', sa.country,
          'city', sa.city,
          'airport_name', sa.name,
          'airport_code', sa.code
        ) as source,
        json_build_object(
          'country', da.country,
          'city', da.city,
          'airport_name', da.name,
          'airport_code', da.code
        ) as destination,
        json_build_object(
          'id', vt.id,
          'type_name', vt.type_name,
          'total_seats', vt.total_seats,
          'seating_plan', vt.seating_plan,
          'max_crew', vt.max_crew,
          'max_passengers', vt.max_passengers,
          'menu_description', vt.menu_description
        ) as vehicle_type
      FROM flight_crew_assignments fca
      JOIN flights f ON fca.flight_id = f.id
      JOIN airports sa ON f.source_airport_id = sa.id
      JOIN airports da ON f.destination_airport_id = da.id
      JOIN vehicle_types vt ON f.vehicle_type_id = vt.id
      WHERE ${crew_id} = ANY (fca.cabin_crew_ids)
      ORDER BY f.flight_date ASC
    `;

    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error("Error in getFlightsByCrewId:", error);
    return res.status(500).json({
      success: false,
      message: "Error loading flights for cabin crew",
      error: error.message,
    });
  }
};
