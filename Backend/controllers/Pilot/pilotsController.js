import { sql } from '../../config/db.js';
import { getPilotWithLanguages } from './pilots_languagesController.js';

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
        await sql.query(
          'INSERT INTO pilot_languages (pilot_id, language_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [pilotId, langId]
        );
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
    const existing = await sql.query('SELECT id FROM pilots WHERE id = $1', [id]);
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
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      updateParams.push(name);
      paramIndex++;
    }
    if (age !== undefined) {
      updateFields.push(`age = $${paramIndex}`);
      updateParams.push(age);
      paramIndex++;
    }
    if (gender !== undefined) {
      updateFields.push(`gender = $${paramIndex}`);
      updateParams.push(gender);
      paramIndex++;
    }
    if (nationality !== undefined) {
      updateFields.push(`nationality = $${paramIndex}`);
      updateParams.push(nationality);
      paramIndex++;
    }
    if (vehicle_restriction !== undefined) {
      updateFields.push(`vehicle_restriction = $${paramIndex}`);
      updateParams.push(vehicle_restriction);
      paramIndex++;
    }
    if (allowed_range !== undefined) {
      updateFields.push(`allowed_range = $${paramIndex}`);
      updateParams.push(allowed_range);
      paramIndex++;
    }
    if (seniority_level !== undefined) {
      updateFields.push(`seniority_level = $${paramIndex}`);
      updateParams.push(seniority_level);
      paramIndex++;
    }
    
    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);
    updateParams.push(id);
    
    if (updateFields.length > 1) {
      const query = `UPDATE pilots SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
      await sql.query(query, updateParams);
    }
    
    // Update languages if provided
    if (language_ids !== undefined) {
      // Delete existing languages for this pilot
      await sql.query('DELETE FROM pilot_languages WHERE pilot_id = $1', [id]);
      
      // Insert new languages
      if (Array.isArray(language_ids) && language_ids.length > 0) {
        for (const langId of language_ids) {
          await sql.query(
            'INSERT INTO pilot_languages (pilot_id, language_id) VALUES ($1, $2)',
            [id, langId]
          );
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
    const existing = await sql.query('SELECT id FROM pilots WHERE id = $1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pilot not found'
      });
    }
    
    // Delete pilot
    await sql.query('DELETE FROM pilots WHERE id = $1', [id]);
    
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
