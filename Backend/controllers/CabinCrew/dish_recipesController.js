import { sql } from "../../config/db.js";

//CRUD Operations for "dish_recipes" table
export const getAllDishRecipes = async (req, res) => {
  try {
    const allDishRecipes = await sql`
      SELECT dr.id, dr.recipe_name, dr.description, dr.created_at,
             cc.first_name AS chef_first_name, cc.last_name AS chef_last_name
      FROM dish_recipes dr
      JOIN cabin_crew cc ON dr.chef_id = cc.id
      ORDER BY dr.created_at DESC
    `;
    
    if (allDishRecipes.length === 0) {
      return res.status(404).json({ success: false, message: "No dish recipes found" });
    }

    res.status(200).json({ success: true, data: allDishRecipes });
  } catch (error) {
    console.error("Error in getAllDishRecipes:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getDishRecipe = async (req, res) => {
  const { id } = req.params;
  try {
    const dishRecipe = await sql`
      SELECT dr.id, dr.recipe_name, dr.description, dr.created_at,
             cc.first_name AS chef_first_name, cc.last_name AS chef_last_name
      FROM dish_recipes dr
      JOIN cabin_crew cc ON dr.chef_id = cc.id
      WHERE dr.id = ${id}
    `;

    if (dishRecipe.length === 0) {
      return res.status(404).json({ success: false, message: "Dish recipe not found" });
    }

    res.status(200).json({ success: true, data: dishRecipe[0] });
  } catch (error) {
    console.error("Error in getDishRecipe:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createDishRecipe = async (req, res) => {
  const { chef_id, recipe_name, description } = req.body;
  
  if (!chef_id || !recipe_name || !description) {
    return res.status(400).json({ success: false, message: "Missing required fields: chef_id, recipe_name, description" });
  }
  
  try {
    const newDishRecipe = await sql`
      INSERT INTO dish_recipes (chef_id, recipe_name, description)
      VALUES (${chef_id}, ${recipe_name}, ${description})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: newDishRecipe[0] });
  } catch (error) {
    console.error("Error in createDishRecipe:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

export const updateDishRecipe = async (req, res) => {
  const { id } = req.params;
  const { chef_id, recipe_name, description } = req.body;
  
  if (!chef_id || !recipe_name || !description) {
    return res.status(400).json({ success: false, message: "Missing required fields: chef_id, recipe_name, description" });
  }
  
  try {
    const updatedDishRecipe = await sql`
      UPDATE dish_recipes
      SET chef_id = ${chef_id}, recipe_name = ${recipe_name}, description = ${description}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedDishRecipe.length === 0) {
      return res.status(404).json({ success: false, message: "Dish recipe not found" });
    }

    res.status(200).json({ success: true, data: updatedDishRecipe[0] });
  } catch (error) {
    console.error("Error in updateDishRecipe:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

export const deleteDishRecipe = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM dish_recipes WHERE id = ${id}`;
    res.status(200).json({ success: true, message: "Dish recipe deleted successfully" });
  } catch (error) {
    console.error("Error in deleteDishRecipe:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

