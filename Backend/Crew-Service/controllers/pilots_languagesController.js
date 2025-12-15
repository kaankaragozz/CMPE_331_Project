import { sql } from '../config/db.js';

// Helper function to fetch pilot with languages
export const getPilotWithLanguages = async (pilotId) => {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.age,
      p.gender,
      p.nationality,
      p.vehicle_restriction,
      p.allowed_range,
      p.seniority_level,
      p.created_at,
      p.updated_at,
      COALESCE(json_agg(l.name) FILTER (WHERE l.name IS NOT NULL), '[]'::json) as languages
    FROM pilots p
    LEFT JOIN pilot_languages pl ON p.id = pl.pilot_id
    LEFT JOIN languages l ON pl.language_id = l.id
    WHERE p.id = ${pilotId}
    GROUP BY p.id
  `;

  return result.length > 0 ? result[0] : null;
};

// Get all pilots with languages
export const getAllPilots = async (req, res) => {
  try {
    const pilots = await sql`
      SELECT 
        p.id,
        p.name,
        p.age,
        p.gender,
        p.nationality,
        p.vehicle_restriction,
        p.allowed_range,
        p.seniority_level,
        p.created_at,
        p.updated_at,
        COALESCE(json_agg(l.name) FILTER (WHERE l.name IS NOT NULL), '[]'::json) as languages
      FROM pilots p
      LEFT JOIN pilot_languages pl ON p.id = pl.pilot_id
      LEFT JOIN languages l ON pl.language_id = l.id
      GROUP BY p.id
      ORDER BY p.id ASC
    `;

    res.status(200).json({
      success: true,
      count: pilots.length,
      data: pilots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pilots',
      error: error.message
    });
  }
};

// Get pilot by ID with languages
export const getPilotById = async (req, res) => {
  try {
    const { id } = req.params;

    const pilot = await getPilotWithLanguages(id);

    if (!pilot) {
      return res.status(404).json({
        success: false,
        message: 'Pilot not found'
      });
    }

    res.status(200).json({
      success: true,
      data: pilot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pilot',
      error: error.message
    });
  }
};

// Filter pilots by vehicle_restriction and/or seniority_level (with languages)
export const filterPilots = async (req, res) => {
  try {
    const { vehicle_restriction, seniority_level } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.age,
        p.gender,
        p.nationality,
        p.vehicle_restriction,
        p.allowed_range,
        p.seniority_level,
        p.created_at,
        p.updated_at,
        COALESCE(json_agg(l.name) FILTER (WHERE l.name IS NOT NULL), '[]'::json) as languages
      FROM pilots p
      LEFT JOIN pilot_languages pl ON p.id = pl.pilot_id
      LEFT JOIN languages l ON pl.language_id = l.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (vehicle_restriction) {
      query += ` AND p.vehicle_restriction = $${paramIndex}`;
      params.push(vehicle_restriction);
      paramIndex++;
    }

    if (seniority_level) {
      query += ` AND p.seniority_level = $${paramIndex}`;
      params.push(seniority_level);
      paramIndex++;
    }

    query += ' GROUP BY p.id ORDER BY p.id ASC';

    // BURADA ARTIK sql(...) DEĞİL, sql.query(...)
    const pilots = await sql.query(query, params);

    res.status(200).json({
      success: true,
      count: pilots.length,
      filters: {
        vehicle_restriction: vehicle_restriction || 'all',
        seniority_level: seniority_level || 'all'
      },
      data: pilots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error filtering pilots',
      error: error.message
    });
  }
};
