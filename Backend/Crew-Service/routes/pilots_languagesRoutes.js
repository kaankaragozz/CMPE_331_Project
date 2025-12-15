import express from 'express';
const router = express.Router();
import {
  getAllPilots,
  getPilotById,
  filterPilots
} from '../controllers/pilots_languagesController.js';

// GET /api/pilots - List all pilots (with languages)
router.get('/', getAllPilots);

// GET /api/pilots/filter - Filter pilots by vehicle_restriction and/or seniority_level
router.get('/filter', filterPilots);

// GET /api/pilots/:id - Get pilot by ID (with languages)
router.get('/:id', getPilotById);

export default router;
