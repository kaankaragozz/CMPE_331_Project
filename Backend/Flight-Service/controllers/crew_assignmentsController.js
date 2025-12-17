import { sql } from "../config/db.js";

// GET crew assignment for a flight (by flight_number)
export const getCrewAssignmentByFlightNumber = async (req, res) => {
  const { flight_number } = req.params;

  try {
    // 1) Find the flight id from flight_number
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

    // 2) Load assignment
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

  // Basic validation
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
    // 1) Find the flight id
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

    // 2) Convert JS arrays to PostgreSQL int[] literals
    const pilotIdsArray = `{${pilot_ids.join(",")}}`;
    const cabinCrewArray = `{${cabin_crew_ids.join(",")}}`;

    // 3) Insert or update one row per flight
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
