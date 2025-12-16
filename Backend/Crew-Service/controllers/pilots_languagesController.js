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

// Delete all languages from a pilot (pilot_languages junction table)
export const deleteAllPilotLanguages = async (req, res) => {
  try {
    const { pilot_id } = req.params;

    if (!pilot_id) {
      return res.status(400).json({
        success: false,
        message: 'pilot_id is required'
      });
    }

    // Check if pilot exists
    const pilotExists = await sql`SELECT id FROM pilots WHERE id = ${pilot_id}`;
    if (pilotExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pilot not found'
      });
    }

    // Delete all languages for this pilot
    const result = await sql`
      DELETE FROM pilot_languages 
      WHERE pilot_id = ${pilot_id}
    `;

    res.status(200).json({
      success: true,
      message: 'All pilot language associations deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pilot languages:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting pilot languages',
      error: error.message
    });
  }
};

// Delete a specific language from a pilot (pilot_languages junction table)
export const deletePilotLanguage = async (req, res) => {
  try {
    const { pilot_id, language_id } = req.params;

    // Validate parameters
    if (!pilot_id || !language_id) {
      return res.status(400).json({
        success: false,
        message: 'Both pilot_id and language_id are required'
      });
    }

    // Check if the pilot_languages entry exists
    const existing = await sql`
      SELECT * FROM pilot_languages 
      WHERE pilot_id = ${pilot_id} AND language_id = ${language_id}
    `;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pilot language association not found'
      });
    }

    // Delete the pilot_languages entry
    await sql`
      DELETE FROM pilot_languages 
      WHERE pilot_id = ${pilot_id} AND language_id = ${language_id}
    `;

    res.status(200).json({
      success: true,
      message: 'Pilot language association deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pilot language:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting pilot language',
      error: error.message
    });
  }
};
