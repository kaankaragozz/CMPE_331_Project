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
      vt.type_name as vehicle_restriction,
      p.allowed_range,
      p.seniority_level,
      p.created_at,
      p.updated_at,
      COALESCE(json_agg(l.name) FILTER (WHERE l.name IS NOT NULL), '[]'::json) as languages
    FROM pilots p
    LEFT JOIN vehicle_types vt ON p.vehicle_type_id = vt.id
    LEFT JOIN pilot_languages pl ON p.id = pl.pilot_id
    LEFT JOIN languages l ON pl.language_id = l.id
    WHERE p.id = ${pilotId}
    GROUP BY p.id, vt.type_name
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
        vt.type_name as vehicle_restriction,
        p.allowed_range,
        p.seniority_level,
        p.created_at,
        p.updated_at,
        COALESCE(json_agg(l.name) FILTER (WHERE l.name IS NOT NULL), '[]'::json) as languages
      FROM pilots p
      LEFT JOIN vehicle_types vt ON p.vehicle_type_id = vt.id
      LEFT JOIN pilot_languages pl ON p.id = pl.pilot_id
      LEFT JOIN languages l ON pl.language_id = l.id
      GROUP BY p.id, vt.type_name
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

// Filter pilots by vehicle_restriction (type_name) and/or seniority_level (with languages)
export const filterPilots = async (req, res) => {
  try {
    const { vehicle_restriction, seniority_level } = req.query;

    // Build query with conditional filters
    let pilots;
    if (vehicle_restriction && seniority_level) {
      pilots = await sql`
        SELECT 
          p.id,
          p.name,
          p.age,
          p.gender,
          p.nationality,
          vt.type_name as vehicle_restriction,
          p.allowed_range,
          p.seniority_level,
          p.created_at,
          p.updated_at,
          COALESCE(json_agg(l.name) FILTER (WHERE l.name IS NOT NULL), '[]'::json) as languages
        FROM pilots p
        LEFT JOIN vehicle_types vt ON p.vehicle_type_id = vt.id
        LEFT JOIN pilot_languages pl ON p.id = pl.pilot_id
        LEFT JOIN languages l ON pl.language_id = l.id
        WHERE vt.type_name = ${vehicle_restriction} AND p.seniority_level = ${seniority_level}
        GROUP BY p.id, vt.type_name
        ORDER BY p.id ASC
      `;
    } else if (vehicle_restriction) {
      pilots = await sql`
        SELECT 
          p.id,
          p.name,
          p.age,
          p.gender,
          p.nationality,
          vt.type_name as vehicle_restriction,
          p.allowed_range,
          p.seniority_level,
          p.created_at,
          p.updated_at,
          COALESCE(json_agg(l.name) FILTER (WHERE l.name IS NOT NULL), '[]'::json) as languages
        FROM pilots p
        LEFT JOIN vehicle_types vt ON p.vehicle_type_id = vt.id
        LEFT JOIN pilot_languages pl ON p.id = pl.pilot_id
        LEFT JOIN languages l ON pl.language_id = l.id
        WHERE vt.type_name = ${vehicle_restriction}
        GROUP BY p.id, vt.type_name
        ORDER BY p.id ASC
      `;
    } else if (seniority_level) {
      pilots = await sql`
        SELECT 
          p.id,
          p.name,
          p.age,
          p.gender,
          p.nationality,
          vt.type_name as vehicle_restriction,
          p.allowed_range,
          p.seniority_level,
          p.created_at,
          p.updated_at,
          COALESCE(json_agg(l.name) FILTER (WHERE l.name IS NOT NULL), '[]'::json) as languages
        FROM pilots p
        LEFT JOIN vehicle_types vt ON p.vehicle_type_id = vt.id
        LEFT JOIN pilot_languages pl ON p.id = pl.pilot_id
        LEFT JOIN languages l ON pl.language_id = l.id
        WHERE p.seniority_level = ${seniority_level}
        GROUP BY p.id, vt.type_name
        ORDER BY p.id ASC
      `;
    } else {
      // No filters, return all
      pilots = await sql`
        SELECT 
          p.id,
          p.name,
          p.age,
          p.gender,
          p.nationality,
          vt.type_name as vehicle_restriction,
          p.allowed_range,
          p.seniority_level,
          p.created_at,
          p.updated_at,
          COALESCE(json_agg(l.name) FILTER (WHERE l.name IS NOT NULL), '[]'::json) as languages
        FROM pilots p
        LEFT JOIN vehicle_types vt ON p.vehicle_type_id = vt.id
        LEFT JOIN pilot_languages pl ON p.id = pl.pilot_id
        LEFT JOIN languages l ON pl.language_id = l.id
        GROUP BY p.id, vt.type_name
        ORDER BY p.id ASC
      `;
    }

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
