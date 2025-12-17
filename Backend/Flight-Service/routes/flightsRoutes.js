import express from 'express';
import { getAllFlights, getFlightByNumber, createFlight, updateFlight, deleteFlight } from '../controllers/flightsController.js';

const router = express.Router();

router.get('/', getAllFlights);
router.get('/:flight_number', getFlightByNumber);
router.post('/', createFlight);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);

export default router;