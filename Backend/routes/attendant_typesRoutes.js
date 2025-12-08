import express from 'express';
import { sql } from '../config/db.js';

const router = express.Router();

// GET all attendant types
router.get('/', async (req, res) => {
  try {
    const attendantTypes = await sql`SELECT * FROM attendant_types ORDER BY id`;
    res.status(200).json({ success: true, data: attendantTypes });
  } catch (error) {
    console.error('Error fetching attendant types:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET attendant type by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const attendantType = await sql`SELECT * FROM attendant_types WHERE id = ${id}`;
    if (attendantType.length === 0) {
      return res.status(404).json({ success: false, message: 'Attendant type not found' });
    }
    res.status(200).json({ success: true, data: attendantType[0] });
  } catch (error) {
    console.error('Error fetching attendant type:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST create attendant type
router.post('/', async (req, res) => {
  const { type_name, min_count, max_count } = req.body;
  try {
    const newType = await sql`
      INSERT INTO attendant_types (type_name, min_count, max_count)
      VALUES (${type_name}, ${min_count}, ${max_count})
      RETURNING *
    `;
    res.status(201).json({ success: true, data: newType[0] });
  } catch (error) {
    console.error('Error creating attendant type:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PUT update attendant type
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type_name, min_count, max_count } = req.body;
  try {
    const updated = await sql`
      UPDATE attendant_types
      SET type_name = ${type_name}, min_count = ${min_count}, max_count = ${max_count}
      WHERE id = ${id}
      RETURNING *
    `;
    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Attendant type not found' });
    }
    res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating attendant type:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE attendant type
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM attendant_types WHERE id = ${id}`;
    res.status(200).json({ success: true, message: 'Attendant type deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendant type:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
