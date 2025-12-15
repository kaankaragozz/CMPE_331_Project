import { sql } from '../config/db.js';

// GET all flights
export const getAllFlights = async (req, res) => {
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
        -- Source airport info
        json_build_object(
          'country', sa.country,
          'city', sa.city,
          'airport_name', sa.name,
          'airport_code', sa.code
        ) as source,
        -- Destination airport info
        json_build_object(
          'country', da.country,
          'city', da.city,
          'airport_name', da.name,
          'airport_code', da.code
        ) as destination,
        -- Vehicle type info
        json_build_object(
          'id', vt.id,
          'type_name', vt.type_name,
          'total_seats', vt.total_seats,
          'seating_plan', vt.seating_plan,
          'max_crew', vt.max_crew,
          'max_passengers', vt.max_passengers,
          'menu_description', vt.menu_description
        ) as vehicle_type
      FROM flights f
      INNER JOIN airports sa ON f.source_airport_id = sa.id
      INNER JOIN airports da ON f.destination_airport_id = da.id
      INNER JOIN vehicle_types vt ON f.vehicle_type_id = vt.id
      ORDER BY f.flight_date DESC
    `;

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (error) {
    console.error("Error in getAllFlights:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// GET flight by flight number
export const getFlightByNumber = async (req, res) => {
  const { flight_number } = req.params;

  // Validate flight number format (AANNNN)
  const flightNumberPattern = /^[A-Z]{2}\d{4}$/;
  if (!flightNumberPattern.test(flight_number.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: "Invalid flight number format. Must be in AANNNN format (e.g., AA1234)"
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
        -- Source airport info
        json_build_object(
          'country', sa.country,
          'city', sa.city,
          'airport_name', sa.name,
          'airport_code', sa.code
        ) as source,
        -- Destination airport info
        json_build_object(
          'country', da.country,
          'city', da.city,
          'airport_name', da.name,
          'airport_code', da.code
        ) as destination,
        -- Vehicle type info
        json_build_object(
          'id', vt.id,
          'type_name', vt.type_name,
          'total_seats', vt.total_seats,
          'seating_plan', vt.seating_plan,
          'max_crew', vt.max_crew,
          'max_passengers', vt.max_passengers,
          'menu_description', vt.menu_description
        ) as vehicle_type
      FROM flights f
      INNER JOIN airports sa ON f.source_airport_id = sa.id
      INNER JOIN airports da ON f.destination_airport_id = da.id
      INNER JOIN vehicle_types vt ON f.vehicle_type_id = vt.id
      WHERE UPPER(f.flight_number) = UPPER(${flight_number})
    `;

    if (flights.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Flight with number ${flight_number} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: flights[0]
    });
  } catch (error) {
    console.error("Error in getFlightByNumber:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// POST create new flight
export const createFlight = async (req, res) => {
  const {
    flight_number,
    flight_date,
    duration_minutes,
    distance_km,
    source_airport_code,
    destination_airport_code,
    vehicle_type_id,
    is_shared,
    shared_flight_number,
    shared_airline_name,
    connecting_flight_info
  } = req.body;

  // Validation
  if (!flight_number || !flight_date || !duration_minutes || !distance_km ||
    !source_airport_code || !destination_airport_code || !vehicle_type_id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: flight_number, flight_date, duration_minutes, distance_km, source_airport_code, destination_airport_code, vehicle_type_id"
    });
  }

  // Validate flight number format
  const flightNumberPattern = /^[A-Z]{2}\d{4}$/;
  if (!flightNumberPattern.test(flight_number.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: "Invalid flight number format. Must be in AANNNN format (e.g., AA1234)"
    });
  }

  // Validate shared flight info
  if (is_shared && (!shared_flight_number || !shared_airline_name)) {
    return res.status(400).json({
      success: false,
      message: "shared_flight_number and shared_airline_name are required when is_shared is true"
    });
  }

  try {
    // Get airport IDs
    const sourceAirport = await sql`
      SELECT id FROM airports WHERE UPPER(code) = UPPER(${source_airport_code})
    `;

    const destAirport = await sql`
      SELECT id FROM airports WHERE UPPER(code) = UPPER(${destination_airport_code})
    `;

    if (sourceAirport.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Source airport with code ${source_airport_code} not found`
      });
    }

    if (destAirport.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Destination airport with code ${destination_airport_code} not found`
      });
    }

    // Verify vehicle type exists
    const vehicleType = await sql`
      SELECT id FROM vehicle_types WHERE id = ${vehicle_type_id}
    `;

    if (vehicleType.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Vehicle type with id ${vehicle_type_id} not found`
      });
    }

    // Create flight
    const newFlight = await sql`
      INSERT INTO flights (
        flight_number,
        flight_date,
        duration_minutes,
        distance_km,
        source_airport_id,
        destination_airport_id,
        vehicle_type_id,
        is_shared,
        shared_flight_number,
        shared_airline_name,
        connecting_flight_info,
        updated_at
      ) VALUES (
        UPPER(${flight_number}),
        ${flight_date}::TIMESTAMP,
        ${duration_minutes},
        ${distance_km},
        ${sourceAirport[0].id},
        ${destAirport[0].id},
        ${vehicle_type_id},
        ${is_shared || false},
        ${shared_flight_number ? shared_flight_number.toUpperCase() : null},
        ${shared_airline_name || null},
        ${connecting_flight_info ? JSON.stringify(connecting_flight_info) : null}::JSONB,
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: "Flight created successfully",
      data: newFlight[0]
    });
  } catch (error) {
    console.error("Error in createFlight:", error);

    // Handle unique constraint violation
    if (error.message && error.message.includes('unique')) {
      return res.status(409).json({
        success: false,
        message: `Flight number ${flight_number} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// PUT update flight
export const updateFlight = async (req, res) => {
  const { flight_number } = req.params;
  const updateData = req.body;

  // Validate flight number format
  const flightNumberPattern = /^[A-Z]{2}\d{4}$/;
  if (!flightNumberPattern.test(flight_number.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: "Invalid flight number format. Must be in AANNNN format"
    });
  }

  try {
    // Check if flight exists
    const existingFlight = await sql`
      SELECT id FROM flights WHERE UPPER(flight_number) = UPPER(${flight_number})
    `;

    if (existingFlight.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Flight with number ${flight_number} not found`
      });
    }

    // Build update parts
    let hasUpdates = false;

    // Update flight_date
    if (updateData.flight_date !== undefined) {
      await sql`
        UPDATE flights 
        SET flight_date = ${updateData.flight_date}::TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE UPPER(flight_number) = UPPER(${flight_number})
      `;
      hasUpdates = true;
    }

    // Update duration_minutes
    if (updateData.duration_minutes !== undefined) {
      await sql`
        UPDATE flights 
        SET duration_minutes = ${updateData.duration_minutes},
            updated_at = CURRENT_TIMESTAMP
        WHERE UPPER(flight_number) = UPPER(${flight_number})
      `;
      hasUpdates = true;
    }

    // Update distance_km
    if (updateData.distance_km !== undefined) {
      await sql`
        UPDATE flights 
        SET distance_km = ${updateData.distance_km},
            updated_at = CURRENT_TIMESTAMP
        WHERE UPPER(flight_number) = UPPER(${flight_number})
      `;
      hasUpdates = true;
    }

    // Update source_airport_id
    if (updateData.source_airport_code) {
      const sourceAirport = await sql`
        SELECT id FROM airports WHERE UPPER(code) = UPPER(${updateData.source_airport_code})
      `;
      if (sourceAirport.length > 0) {
        await sql`
          UPDATE flights 
          SET source_airport_id = ${sourceAirport[0].id},
              updated_at = CURRENT_TIMESTAMP
          WHERE UPPER(flight_number) = UPPER(${flight_number})
        `;
        hasUpdates = true;
      }
    }

    // Update destination_airport_id
    if (updateData.destination_airport_code) {
      const destAirport = await sql`
        SELECT id FROM airports WHERE UPPER(code) = UPPER(${updateData.destination_airport_code})
      `;
      if (destAirport.length > 0) {
        await sql`
          UPDATE flights 
          SET destination_airport_id = ${destAirport[0].id},
              updated_at = CURRENT_TIMESTAMP
          WHERE UPPER(flight_number) = UPPER(${flight_number})
        `;
        hasUpdates = true;
      }
    }

    // Update vehicle_type_id
    if (updateData.vehicle_type_id !== undefined) {
      await sql`
        UPDATE flights 
        SET vehicle_type_id = ${updateData.vehicle_type_id},
            updated_at = CURRENT_TIMESTAMP
        WHERE UPPER(flight_number) = UPPER(${flight_number})
      `;
      hasUpdates = true;
    }

    // Update is_shared
    if (updateData.is_shared !== undefined) {
      await sql`
        UPDATE flights 
        SET is_shared = ${updateData.is_shared},
            updated_at = CURRENT_TIMESTAMP
        WHERE UPPER(flight_number) = UPPER(${flight_number})
      `;
      hasUpdates = true;
    }

    // Update shared_flight_number
    if (updateData.shared_flight_number !== undefined) {
      await sql`
        UPDATE flights 
        SET shared_flight_number = ${updateData.shared_flight_number ? updateData.shared_flight_number.toUpperCase() : null},
            updated_at = CURRENT_TIMESTAMP
        WHERE UPPER(flight_number) = UPPER(${flight_number})
      `;
      hasUpdates = true;
    }

    // Update shared_airline_name
    if (updateData.shared_airline_name !== undefined) {
      await sql`
        UPDATE flights 
        SET shared_airline_name = ${updateData.shared_airline_name},
            updated_at = CURRENT_TIMESTAMP
        WHERE UPPER(flight_number) = UPPER(${flight_number})
      `;
      hasUpdates = true;
    }

    // Update connecting_flight_info
    if (updateData.connecting_flight_info !== undefined) {
      await sql`
        UPDATE flights 
        SET connecting_flight_info = ${updateData.connecting_flight_info ? JSON.stringify(updateData.connecting_flight_info) : null}::JSONB,
            updated_at = CURRENT_TIMESTAMP
        WHERE UPPER(flight_number) = UPPER(${flight_number})
      `;
      hasUpdates = true;
    }

    if (!hasUpdates) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    // Get updated flight
    const updatedFlight = await sql`
      SELECT * FROM flights WHERE UPPER(flight_number) = UPPER(${flight_number})
    `;

    res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      data: updatedFlight[0]
    });
  } catch (error) {
    console.error("Error in updateFlight:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// DELETE flight
export const deleteFlight = async (req, res) => {
  const { flight_number } = req.params;

  // Validate flight number format
  const flightNumberPattern = /^[A-Z]{2}\d{4}$/;
  if (!flightNumberPattern.test(flight_number.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: "Invalid flight number format. Must be in AANNNN format"
    });
  }

  try {
    const deletedFlight = await sql`
      DELETE FROM flights 
      WHERE UPPER(flight_number) = UPPER(${flight_number})
      RETURNING *
    `;

    if (deletedFlight.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Flight with number ${flight_number} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: "Flight deleted successfully",
      data: deletedFlight[0]
    });
  } catch (error) {
    console.error("Error in deleteFlight:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

