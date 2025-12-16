import { sql } from '../config/db.js';
import { getPilotWithLanguages } from './pilots_languagesController.js';

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
    console.error('Error fetching pilots:', error);
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
    console.error('Error fetching pilot:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pilot',
      error: error.message
    });
  }
};

// Create a new pilot (basic insert) and return aggregated pilot
export const createPilot = async (req, res) => {
  try {
    const { name, age, gender, nationality, vehicle_restriction, allowed_range, seniority_level, language_ids } = req.body;

    // Validation
    if (!name || !age || !gender || !nationality || !vehicle_restriction || !allowed_range || !seniority_level) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, age, gender, nationality, vehicle_restriction, allowed_range, seniority_level'
      });
    }

    if (!['Senior', 'Junior', 'Trainee'].includes(seniority_level)) {
      return res.status(400).json({
        success: false,
        message: 'seniority_level must be one of: Senior, Junior, Trainee'
      });
    }

    // Insert pilot (tagged template kullanımı doğru)
    const result = await sql`
      INSERT INTO pilots (name, age, gender, nationality, vehicle_restriction, allowed_range, seniority_level, created_at, updated_at) 
      VALUES (${name}, ${age}, ${gender}, ${nationality}, ${vehicle_restriction}, ${allowed_range}, ${seniority_level}, NOW(), NOW()) 
      RETURNING id
    `;

    const pilotId = result[0].id;

    // Insert languages if provided
    if (language_ids && Array.isArray(language_ids) && language_ids.length > 0) {
      for (const langId of language_ids) {
        await sql`
          INSERT INTO pilot_languages (pilot_id, language_id)
          VALUES (${pilotId}, ${langId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    // Fetch the created pilot with languages
    const pilot = await getPilotWithLanguages(pilotId);

    res.status(201).json({
      success: true,
      message: 'Pilot created successfully',
      data: pilot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating pilot',
      error: error.message
    });
  }
};

// Update pilot details and languages (basic update + aggregated fetch)
export const updatePilot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, nationality, vehicle_restriction, allowed_range, seniority_level, language_ids } = req.body;

    // Check if pilot exists
    const existing = await sql`
      SELECT id FROM pilots WHERE id = ${id}
    `;
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pilot not found'
      });
    }

    // Validate seniority_level if provided
    if (seniority_level && !['Senior', 'Junior', 'Trainee'].includes(seniority_level)) {
      return res.status(400).json({
        success: false,
        message: 'seniority_level must be one of: Senior, Junior, Trainee'
      });
    }

    // Update pilot fields (only provided fields)
    // Note: Using separate UPDATE statements for each field is simpler with Neon serverless tagged templates
    if (name !== undefined) {
      await sql`UPDATE pilots SET name = ${name}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (age !== undefined) {
      await sql`UPDATE pilots SET age = ${age}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (gender !== undefined) {
      await sql`UPDATE pilots SET gender = ${gender}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (nationality !== undefined) {
      await sql`UPDATE pilots SET nationality = ${nationality}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (vehicle_restriction !== undefined) {
      await sql`UPDATE pilots SET vehicle_restriction = ${vehicle_restriction}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (allowed_range !== undefined) {
      await sql`UPDATE pilots SET allowed_range = ${allowed_range}, updated_at = NOW() WHERE id = ${id}`;
    }
    if (seniority_level !== undefined) {
      await sql`UPDATE pilots SET seniority_level = ${seniority_level}, updated_at = NOW() WHERE id = ${id}`;
    }

    // Update languages if provided
    if (language_ids !== undefined) {
      // Delete existing languages for this pilot
      await sql`DELETE FROM pilot_languages WHERE pilot_id = ${id}`;

      // Insert new languages
      if (Array.isArray(language_ids) && language_ids.length > 0) {
        for (const langId of language_ids) {
          await sql`
            INSERT INTO pilot_languages (pilot_id, language_id)
            VALUES (${id}, ${langId})
          `;
        }
      }
    }

    // Fetch updated pilot with languages
    const pilot = await getPilotWithLanguages(id);

    res.status(200).json({
      success: true,
      message: 'Pilot updated successfully',
      data: pilot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating pilot',
      error: error.message
    });
  }
};

// Delete pilot
export const deletePilot = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if pilot exists
    const existing = await sql`
      SELECT id FROM pilots WHERE id = ${id}
    `;
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pilot not found'
      });
    }

    // Delete pilot
    await sql`DELETE FROM pilots WHERE id = ${id}`;

    res.status(200).json({
      success: true,
      message: 'Pilot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting pilot',
      error: error.message
    });
  }
};
