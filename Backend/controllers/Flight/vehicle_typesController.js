import { sql } from "../../config/db.js";

// GET all vehicle types
export const getAllVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await sql`
      SELECT id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
      FROM vehicle_types
      ORDER BY id ASC
    `;

    res.status(200).json({
      success: true,
      count: vehicleTypes.length,
      data: vehicleTypes
    });
  } catch (error) {
    console.error("Error in getAllVehicleTypes:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// GET vehicle type by id
export const getVehicleTypeById = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Vehicle type ID must be a valid number"
    });
  }

  try {
    const vehicleType = await sql`
      SELECT id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
      FROM vehicle_types
      WHERE id = ${parseInt(id)}
    `;

    if (vehicleType.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Vehicle type with ID ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: vehicleType[0]
    });
  } catch (error) {
    console.error("Error in getVehicleTypeById:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// POST create new vehicle type
export const createVehicleType = async (req, res) => {
  const { type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description } = req.body;

  // Validation
  if (!type_name || total_seats === undefined || !seating_plan || max_crew === undefined || max_passengers === undefined) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: type_name, total_seats, seating_plan, max_crew, max_passengers"
    });
  }

  if (max_passengers > total_seats) {
    return res.status(400).json({
      success: false,
      message: "max_passengers cannot exceed total_seats"
    });
  }

  try {
    const newVehicleType = await sql`
      INSERT INTO vehicle_types (type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description)
      VALUES (${type_name}, ${total_seats}, ${JSON.stringify(seating_plan)}::JSONB, ${max_crew}, ${max_passengers}, ${menu_description || null})
      RETURNING id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
    `;

    res.status(201).json({
      success: true,
      message: "Vehicle type created successfully",
      data: newVehicleType[0]
    });
  } catch (error) {
    console.error("Error in createVehicleType:", error);

    if (error.message && error.message.includes('unique')) {
      return res.status(409).json({
        success: false,
        message: `Vehicle type '${type_name}' already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// PUT update vehicle type
export const updateVehicleType = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Vehicle type ID must be a valid number"
    });
  }

  try {
    // Check if vehicle type exists
    const existingVehicleType = await sql`
      SELECT id FROM vehicle_types WHERE id = ${parseInt(id)}
    `;

    if (existingVehicleType.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Vehicle type with ID ${id} not found`
      });
    }

    // Validate max_passengers vs total_seats if both provided
    if (updateData.max_passengers !== undefined && updateData.total_seats !== undefined) {
      if (updateData.max_passengers > updateData.total_seats) {
        return res.status(400).json({
          success: false,
          message: "max_passengers cannot exceed total_seats"
        });
      }
    }

    // Build conditional update based on provided fields
    let updatedVehicleType;
    const idNum = parseInt(id);

    if (updateData.type_name !== undefined) {
      updatedVehicleType = await sql`
        UPDATE vehicle_types
        SET type_name = ${updateData.type_name}
        WHERE id = ${idNum}
        RETURNING id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
      `;
    } else if (updateData.total_seats !== undefined) {
      updatedVehicleType = await sql`
        UPDATE vehicle_types
        SET total_seats = ${updateData.total_seats}
        WHERE id = ${idNum}
        RETURNING id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
      `;
    } else if (updateData.seating_plan !== undefined) {
      updatedVehicleType = await sql`
        UPDATE vehicle_types
        SET seating_plan = ${JSON.stringify(updateData.seating_plan)}::JSONB
        WHERE id = ${idNum}
        RETURNING id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
      `;
    } else if (updateData.max_crew !== undefined) {
      updatedVehicleType = await sql`
        UPDATE vehicle_types
        SET max_crew = ${updateData.max_crew}
        WHERE id = ${idNum}
        RETURNING id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
      `;
    } else if (updateData.max_passengers !== undefined) {
      updatedVehicleType = await sql`
        UPDATE vehicle_types
        SET max_passengers = ${updateData.max_passengers}
        WHERE id = ${idNum}
        RETURNING id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
      `;
    } else if (updateData.menu_description !== undefined) {
      updatedVehicleType = await sql`
        UPDATE vehicle_types
        SET menu_description = ${updateData.menu_description}
        WHERE id = ${idNum}
        RETURNING id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
      `;
    } else {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle type updated successfully",
      data: updatedVehicleType[0]
    });
  } catch (error) {
    console.error("Error in updateVehicleType:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// DELETE vehicle type
export const deleteVehicleType = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Vehicle type ID must be a valid number"
    });
  }

  try {
    const deletedVehicleType = await sql`
      DELETE FROM vehicle_types
      WHERE id = ${parseInt(id)}
      RETURNING id, type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description, created_at
    `;

    if (deletedVehicleType.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Vehicle type with ID ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle type deleted successfully",
      data: deletedVehicleType[0]
    });
  } catch (error) {
    console.error("Error in deleteVehicleType:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
