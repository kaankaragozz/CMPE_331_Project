import express from 'express';
import { getAllDeneme, getDeneme, createDeneme, updateDeneme, deleteDeneme } from '../controllers/denemeController.js';

const router = express.Router();

router.get('/', getAllDeneme);
router.get('/:id', getDeneme);
router.post('/', createDeneme);
router.put('/:id', updateDeneme);
router.delete('/:id', deleteDeneme);

export default router;