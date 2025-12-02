import express from 'express';
import {
  getAllFlights,
  getFlightByNumber,
  createFlight,
  updateFlight,
  deleteFlight
} from '../controllers/flightinfoController.js';

const router = express.Router();

// GET all flights
router.get('/', getAllFlights);

// GET flight by flight number
router.get('/:flight_number', getFlightByNumber);

// POST create new flight
router.post('/', createFlight);

// PUT update flight
router.put('/:flight_number', updateFlight);

// DELETE flight
router.delete('/:flight_number', deleteFlight);

export default router;

