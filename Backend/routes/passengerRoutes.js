import express from 'express';
import {
  getPassengersByFlight,
  addPassengerToFlight,
  autoAssignSeats,
  getAffiliatedPassengers,
  assignSeatManually
} from '../controllers/passengerController.js';

const router = express.Router();

// GET all passengers for a specific flight
router.get('/flight/:flight_number', getPassengersByFlight);

// POST create new passenger and assign to flight
router.post('/', addPassengerToFlight);

// POST Trigger auto seat assignment for a flight
router.post('/flight/:flight_number/assign-seats', autoAssignSeats);

// GET affiliated seating info (families)
router.get('/flight/:flight_number/affiliations', getAffiliatedPassengers);

// PUT Manual Seat Assignment
router.put('/flight/:flight_number/manual-assign', assignSeatManually);

export default router;