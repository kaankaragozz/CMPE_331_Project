import express from 'express';
// Import ALL controller functions (Added missing GET controllers)
import {
  getAllPilots, // <--- This was missing
  getPilotById, // <--- This was missing
  createPilot,
  updatePilot,
  deletePilot
} from '../controllers/pilotsController.js';

const router = express.Router();

// =================================================================
// Routes for /api/pilots
// Note: The prefix "/api/pilots" is defined in server.js
// We use "/" here to refer to the base path.
// =================================================================

// @route   GET /api/pilots
// @desc    Get all pilots
// @access  Public
router.get('/', getAllPilots);

// @route   GET /api/pilots/:id
// @desc    Get a single pilot by ID
// @access  Public
router.get('/:id', getPilotById);

// @route   POST /api/pilots
// @desc    Create a new pilot
// @access  Public
router.post('/', createPilot);

// @route   PUT /api/pilots/:id
// @desc    Update a pilot details
// @access  Public
router.put('/:id', updatePilot);

// @route   DELETE /api/pilots/:id
// @desc    Delete a pilot
// @access  Public
router.delete('/:id', deletePilot);

export default router;