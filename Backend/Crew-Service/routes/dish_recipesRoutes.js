import express from 'express';
import {
  getAllDishRecipes,
  getDishRecipe,
  createDishRecipe,
  updateDishRecipe,
  deleteDishRecipe

} from '../controllers/dish_recipesController.js';

const router = express.Router();

router.get('/', getAllDishRecipes);
router.get('/:id', getDishRecipe);
router.post('/', createDishRecipe);
router.put('/:id', updateDishRecipe);
router.delete('/:id', deleteDishRecipe);



export default router;
