import express from 'express';
import { assignRecipeToFlight, getAssignedRecipes } from '../controllers/flight_recipeController.js';
const router = express.Router();


// Get all recipes assigned to a flight
router.get('/:flight_number', getAssignedRecipes);

// Assign a recipe to a flight
router.post('/:flight_number/assign-recipe', assignRecipeToFlight);

export default router;