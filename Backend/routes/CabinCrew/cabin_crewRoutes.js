import express from 'express';
import {
  getAllCabinCrew,
  getCabinCrew,
  createCabinCrew,
  updateCabinCrew,
  deleteCabinCrew
} from '../../controllers/CabinCrew/cabin_crewController.js';

const router = express.Router();

router.get('/', getAllCabinCrew);
router.get('/:id', getCabinCrew);
router.post('/', createCabinCrew);
router.put('/:id', updateCabinCrew);
router.delete('/:id', deleteCabinCrew);

export default router;
