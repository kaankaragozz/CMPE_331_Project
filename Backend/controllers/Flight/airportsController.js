import { sql } from '../../config/db.js';

// GET all airports
export const getAllAirports = async (req, res) => {
  try {
    const airports = await sql`
      SELECT id, code, name, city, country, created_at
      FROM airports
      ORDER BY code ASC
    `;

    res.status(200).json({
      success: true,
      count: airports.length,
      data: airports
    });
  } catch (error) {
    console.error("Error in getAllAirports:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// GET airport by code
export const getAirportByCode = async (req, res) => {
  const { code } = req.params;

  if (!code || code.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Airport code is required"
    });
  }

  try {
    const airport = await sql`
      SELECT id, code, name, city, country, created_at
      FROM airports
      WHERE UPPER(code) = UPPER(${code})
    `;

    if (airport.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Airport with code ${code} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: airport[0]
    });
  } catch (error) {
    console.error("Error in getAirportByCode:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// POST create new airport
export const createAirport = async (req, res) => {
  const { code, name, city, country } = req.body;

  // Validation
  if (!code || !name || !city || !country) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: code, name, city, country"
    });
  }

  if (code.length !== 3) {
    return res.status(400).json({
      success: false,
      message: "Airport code must be exactly 3 characters"
    });
  }

  try {
    const newAirport = await sql`
      INSERT INTO airports (code, name, city, country)
      VALUES (UPPER(${code}), ${name}, ${city}, ${country})
      RETURNING id, code, name, city, country, created_at
    `;

    res.status(201).json({
      success: true,
      message: "Airport created successfully",
      data: newAirport[0]
    });
  } catch (error) {
    console.error("Error in createAirport:", error);

    if (error.message && error.message.includes('unique')) {
      return res.status(409).json({
        success: false,
        message: `Airport with code ${code} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// PUT update airport
export const updateAirport = async (req, res) => {
  const { code } = req.params;
  const updateData = req.body;

  if (!code || code.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Airport code is required"
    });
  }

  try {
    // Check if airport exists
    const existingAirport = await sql`
      SELECT id FROM airports WHERE UPPER(code) = UPPER(${code})
    `;

    if (existingAirport.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Airport with code ${code} not found`
      });
    }

    // Build conditional update based on provided fields
    let updatedAirport;

    if (updateData.name !== undefined && updateData.city !== undefined && updateData.country !== undefined) {
      updatedAirport = await sql`
        UPDATE airports
        SET name = ${updateData.name}, city = ${updateData.city}, country = ${updateData.country}
        WHERE UPPER(code) = UPPER(${code})
        RETURNING id, code, name, city, country, created_at
      `;
    } else if (updateData.name !== undefined && updateData.city !== undefined) {
      updatedAirport = await sql`
        UPDATE airports
        SET name = ${updateData.name}, city = ${updateData.city}
        WHERE UPPER(code) = UPPER(${code})
        RETURNING id, code, name, city, country, created_at
      `;
    } else if (updateData.name !== undefined && updateData.country !== undefined) {
      updatedAirport = await sql`
        UPDATE airports
        SET name = ${updateData.name}, country = ${updateData.country}
        WHERE UPPER(code) = UPPER(${code})
        RETURNING id, code, name, city, country, created_at
      `;
    } else if (updateData.city !== undefined && updateData.country !== undefined) {
      updatedAirport = await sql`
        UPDATE airports
        SET city = ${updateData.city}, country = ${updateData.country}
        WHERE UPPER(code) = UPPER(${code})
        RETURNING id, code, name, city, country, created_at
      `;
    } else if (updateData.name !== undefined) {
      updatedAirport = await sql`
        UPDATE airports
        SET name = ${updateData.name}
        WHERE UPPER(code) = UPPER(${code})
        RETURNING id, code, name, city, country, created_at
      `;
    } else if (updateData.city !== undefined) {
      updatedAirport = await sql`
        UPDATE airports
        SET city = ${updateData.city}
        WHERE UPPER(code) = UPPER(${code})
        RETURNING id, code, name, city, country, created_at
      `;
    } else if (updateData.country !== undefined) {
      updatedAirport = await sql`
        UPDATE airports
        SET country = ${updateData.country}
        WHERE UPPER(code) = UPPER(${code})
        RETURNING id, code, name, city, country, created_at
      `;
    } else {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    res.status(200).json({
      success: true,
      message: "Airport updated successfully",
      data: updatedAirport[0]
    });
  } catch (error) {
    console.error("Error in updateAirport:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// DELETE airport
export const deleteAirport = async (req, res) => {
  const { code } = req.params;

  if (!code || code.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Airport code is required"
    });
  }

  try {
    const deletedAirport = await sql`
      DELETE FROM airports
      WHERE UPPER(code) = UPPER(${code})
      RETURNING id, code, name, city, country, created_at
    `;

    if (deletedAirport.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Airport with code ${code} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: "Airport deleted successfully",
      data: deletedAirport[0]
    });
  } catch (error) {
    console.error("Error in deleteAirport:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
