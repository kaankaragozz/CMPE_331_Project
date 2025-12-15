import express from 'express';
import { getAllVehicleTypes, getVehicleTypeById, createVehicleType, updateVehicleType, deleteVehicleType } from '../controllers/vehicle_typesController.js';

const router = express.Router();

router.get('/', getAllVehicleTypes);
router.get('/:id', getVehicleTypeById);
router.post('/', createVehicleType);
router.put('/:id', updateVehicleType);
router.delete('/:id', deleteVehicleType);

export default router;