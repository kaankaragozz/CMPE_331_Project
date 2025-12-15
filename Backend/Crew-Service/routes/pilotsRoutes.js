import express from 'express';
const router = express.Router();
import {
  createPilot,
  updatePilot,
  deletePilot
} from '../controllers/pilotsController.js';

// POST /api/pilots - Create a new pilot
router.post('/', createPilot);

// PUT /api/pilots/:id - Update pilot
router.put('/:id', updatePilot);

// DELETE /api/pilots/:id - Delete pilot
router.delete('/:id', deletePilot);

export default router;
