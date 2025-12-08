import express from 'express';
import {
  getAllCabinCrewVehicleRestrictions,
  getCabinCrewVehicleRestriction,
  createCabinCrewVehicleRestriction,
  updateCabinCrewVehicleRestriction,
  deleteCabinCrewVehicleRestriction
} from '../../controllers/CabinCrew/cabin_crew_vehicle_restrictionsController.js';

const router = express.Router();

router.get('/', getAllCabinCrewVehicleRestrictions);
router.get('/:id', getCabinCrewVehicleRestriction);
router.post('/', createCabinCrewVehicleRestriction);
router.put('/:id', updateCabinCrewVehicleRestriction);
router.delete('/:id', deleteCabinCrewVehicleRestriction);

export default router;
