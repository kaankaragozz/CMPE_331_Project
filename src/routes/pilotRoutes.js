const express = require('express');
const router = express.Router();
const {
  getAllPilots,
  filterPilots,
  createPilot
} = require('../controllers/pilotController');

// GET /api/pilots - List all pilots
router.get('/', getAllPilots);

// GET /api/pilots/filter - Filter pilots by vehicle_restriction and/or seniority_level
router.get('/filter', filterPilots);

// POST /api/pilots - Add a new pilot
router.post('/', createPilot);

module.exports = router;




