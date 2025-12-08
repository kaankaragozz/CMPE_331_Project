import express from 'express';
import { sql } from '../config/db.js';

const router = express.Router();

// GET all vehicle restrictions
router.get('/', async (req, res) => {
  try {
    const restrictions = await sql`
      SELECT ccvr.*, cc.first_name, cc.last_name, vt.type_name as vehicle_type
      FROM cabin_crew_vehicle_restrictions ccvr
      JOIN cabin_crew cc ON ccvr.cabin_crew_id = cc.id
      JOIN vehicle_types vt ON ccvr.vehicle_type_id = vt.id
      ORDER BY ccvr.created_at DESC
    `;
    res.status(200).json({ success: true, data: restrictions });
  } catch (error) {
    console.error('Error fetching vehicle restrictions:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET vehicle restrictions by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const restriction = await sql`
      SELECT ccvr.*, cc.first_name, cc.last_name, vt.type_name as vehicle_type
      FROM cabin_crew_vehicle_restrictions ccvr
      JOIN cabin_crew cc ON ccvr.cabin_crew_id = cc.id
      JOIN vehicle_types vt ON ccvr.vehicle_type_id = vt.id
      WHERE ccvr.id = ${id}
    `;
    if (restriction.length === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle restriction not found' });
    }
    res.status(200).json({ success: true, data: restriction[0] });
  } catch (error) {
    console.error('Error fetching vehicle restriction:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST create vehicle restriction
router.post('/', async (req, res) => {
  const { cabin_crew_id, vehicle_type_id } = req.body;
  try {
    const newRestriction = await sql`
      INSERT INTO cabin_crew_vehicle_restrictions (cabin_crew_id, vehicle_type_id)
      VALUES (${cabin_crew_id}, ${vehicle_type_id})
      RETURNING *
    `;
    res.status(201).json({ success: true, data: newRestriction[0] });
  } catch (error) {
    console.error('Error creating vehicle restriction:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PUT update vehicle restriction
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cabin_crew_id, vehicle_type_id } = req.body;
  try {
    const updated = await sql`
      UPDATE cabin_crew_vehicle_restrictions
      SET cabin_crew_id = ${cabin_crew_id}, vehicle_type_id = ${vehicle_type_id}
      WHERE id = ${id}
      RETURNING *
    `;
    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle restriction not found' });
    }
    res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating vehicle restriction:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE vehicle restriction
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cabin_crew_vehicle_restrictions WHERE id = ${id}`;
    res.status(200).json({ success: true, message: 'Vehicle restriction deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle restriction:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
