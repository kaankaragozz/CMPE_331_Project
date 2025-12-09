const express = require('express');
const router = express.Router();
const {
  getAllPilots,
  filterPilots,
  createPilot,
  getPilotById,
  updatePilot,
  deletePilot
} = require('../../controllers/Pilot/pilotController');

// GET /api/pilots - List all pilots
router.get('/', getAllPilots);

// GET /api/pilots/filter - Filter pilots by vehicle_restriction and/or seniority_level
router.get('/filter', filterPilots);

// GET /api/pilots/:id - Get a single pilot by ID
router.get('/:id', getPilotById);

// POST /api/pilots - Add a new pilot
router.post('/', createPilot);

// PUT /api/pilots/:id - Update a pilot by ID
router.put('/:id', updatePilot);

// DELETE /api/pilots/:id - Delete a pilot by ID
router.delete('/:id', deletePilot);

module.exports = router;
