import express from 'express';
import { getAllAirports, getAirportByCode, createAirport, updateAirport, deleteAirport } from '../../controllers/Flight/airportsController.js';

const router = express.Router();

router.get('/', getAllAirports);
router.get('/:code', getAirportByCode);
router.post('/', createAirport);
router.put('/:id', updateAirport);
router.delete('/:id', deleteAirport);

export default router;