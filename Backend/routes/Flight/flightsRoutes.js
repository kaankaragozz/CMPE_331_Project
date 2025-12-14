import express from 'express';
import { getAllFlights, getFlightByNumber, createFlight, updateFlight, deleteFlight, getCrewAssignment, saveCrewAssignment, getFlightPassengers, savePassengerSeats } from '../../controllers/Flight/flightsController.js';

const router = express.Router();

router.get('/', getAllFlights);
router.get('/:flight_number', getFlightByNumber);
router.post('/', createFlight);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);

// CREW ASSIGNMENTS
router.get('/:flight_number/crew', getCrewAssignment);
router.post('/:flight_number/crew', saveCrewAssignment);

// passenger endpoints
router.get('/:flight_number/passengers', getFlightPassengers);
router.post('/:flight_number/passengers/seats', savePassengerSeats);

export default router;