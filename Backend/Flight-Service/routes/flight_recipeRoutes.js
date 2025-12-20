import express from 'express';
import { assignRecipeToFlight } from '../controllers/flight_recipeController.js';
const router = express.Router();

router.post('/:flight_number/assign-recipe', assignRecipeToFlight);

export default router;