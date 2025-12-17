import express from 'express';
import { getAllAirports, getAirportByCode, createAirport, updateAirport, deleteAirport } from '../controllers/airportsController.js';

const router = express.Router();

router.get('/', getAllAirports);
router.get('/:code', getAirportByCode);
router.post('/', createAirport);
router.put('/:code', updateAirport);
router.delete('/:code', deleteAirport);

export default router;