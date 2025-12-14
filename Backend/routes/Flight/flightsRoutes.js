import express from 'express';
import { getAllFlights, getFlightByNumber, createFlight, updateFlight, deleteFlight, getCrewAssignment, saveCrewAssignment } from '../../controllers/Flight/flightsController.js';

const router = express.Router();

router.get('/', getAllFlights);
router.get('/:flight_number', getFlightByNumber);
router.post('/', createFlight);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);

// CREW ASSIGNMENTS
router.get('/:flight_number/crew', getCrewAssignment);
router.post('/:flight_number/crew', saveCrewAssignment);

export default router;