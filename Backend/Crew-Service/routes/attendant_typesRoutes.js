import express from 'express';
import {
  getAllAttendantTypes,
  getAttendantType,
  createAttendantType,
  updateAttendantType,
  deleteAttendantType
} from '../controllers/attendant_typesController.js';

const router = express.Router();

router.get('/', getAllAttendantTypes);
router.get('/:id', getAttendantType);
router.post('/', createAttendantType);
router.put('/:id', updateAttendantType);
router.delete('/:id', deleteAttendantType);

export default router;
