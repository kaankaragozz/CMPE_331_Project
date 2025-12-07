import express from 'express';
import {
  getAllAirports,
  getAirportByCode,
  createAirport,
  updateAirport,
  deleteAirport
} from '../controllers/airportController.js';

const router = express.Router();

// GET all airports
router.get('/', getAllAirports);

// GET airport by code
router.get('/:code', getAirportByCode);

// POST create new airport
router.post('/', createAirport);

// PUT update airport
router.put('/:code', updateAirport);

// DELETE airport
router.delete('/:code', deleteAirport);

export default router;
