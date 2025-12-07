import express from 'express';
import {
  getAllVehicleTypes,
  getVehicleTypeById,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType
} from '../controllers/vehicleTypeController.js';

const router = express.Router();

// GET all vehicle types
router.get('/', getAllVehicleTypes);

// GET vehicle type by id
router.get('/:id', getVehicleTypeById);

// POST create new vehicle type
router.post('/', createVehicleType);

// PUT update vehicle type
router.put('/:id', updateVehicleType);

// DELETE vehicle type
router.delete('/:id', deleteVehicleType);

export default router;
