import express from 'express';
const router = express.Router();
import {
  getAllPilots,
  getPilotById,
  filterPilots,
  deletePilotLanguage,
  deleteAllPilotLanguages
} from '../controllers/pilots_languagesController.js';

// GET /api/pilots-languages - List all pilots (with languages)
router.get('/', getAllPilots);

// GET /api/pilots-languages/filter - Filter pilots by vehicle_restriction and/or seniority_level
router.get('/filter', filterPilots);

// DELETE /api/pilots-languages/:pilot_id/:language_id - Delete a specific language from a pilot
router.delete('/:pilot_id/:language_id', deletePilotLanguage);

// DELETE /api/pilots-languages/:pilot_id - Delete all languages from a pilot
// NOTE: This must come after the two-parameter DELETE route
router.delete('/:pilot_id', deleteAllPilotLanguages);

// GET /api/pilots-languages/:id - Get pilot by ID (with languages)
// NOTE: This must come last to avoid catching DELETE requests
router.get('/:id', getPilotById);

export default router;
