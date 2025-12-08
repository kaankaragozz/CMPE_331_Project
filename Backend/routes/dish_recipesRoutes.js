import express from 'express';
import { sql } from '../config/db.js';

const router = express.Router();

// GET all dish recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await sql`
      SELECT dr.*, cc.first_name, cc.last_name
      FROM dish_recipes dr
      JOIN cabin_crew cc ON dr.chef_id = cc.id
      ORDER BY dr.created_at DESC
    `;
    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    console.error('Error fetching dish recipes:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET dish recipe by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await sql`
      SELECT dr.*, cc.first_name, cc.last_name
      FROM dish_recipes dr
      JOIN cabin_crew cc ON dr.chef_id = cc.id
      WHERE dr.id = ${id}
    `;
    if (recipe.length === 0) {
      return res.status(404).json({ success: false, message: 'Dish recipe not found' });
    }
    res.status(200).json({ success: true, data: recipe[0] });
  } catch (error) {
    console.error('Error fetching dish recipe:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST create dish recipe
router.post('/', async (req, res) => {
  const { chef_id, recipe_name, description } = req.body;
  try {
    const newRecipe = await sql`
      INSERT INTO dish_recipes (chef_id, recipe_name, description)
      VALUES (${chef_id}, ${recipe_name}, ${description})
      RETURNING *
    `;
    res.status(201).json({ success: true, data: newRecipe[0] });
  } catch (error) {
    console.error('Error creating dish recipe:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PUT update dish recipe
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { chef_id, recipe_name, description } = req.body;
  try {
    const updated = await sql`
      UPDATE dish_recipes
      SET chef_id = ${chef_id}, recipe_name = ${recipe_name}, description = ${description}
      WHERE id = ${id}
      RETURNING *
    `;
    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Dish recipe not found' });
    }
    res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating dish recipe:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE dish recipe
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM dish_recipes WHERE id = ${id}`;
    res.status(200).json({ success: true, message: 'Dish recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting dish recipe:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
