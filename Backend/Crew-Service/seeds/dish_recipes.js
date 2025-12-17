import { sql } from "../config/db.js";

const SAMPLE_DISH_RECIPES = [
  { chef_index: 5, recipe_name: 'Mediterranean Salmon', description: 'Grilled salmon with olive oil, lemon, and fresh herbs' },
  { chef_index: 5, recipe_name: 'Beef Wellington', description: 'Classic beef tenderloin wrapped in puff pastry with mushroom duxelles' },
  { chef_index: 5, recipe_name: 'Vegetarian Lasagna', description: 'Layered pasta with ricotta, spinach, and marinara sauce' },
  { chef_index: 5, recipe_name: 'Thai Green Curry', description: 'Aromatic curry with coconut milk, vegetables, and jasmine rice' },
  { chef_index: 5, recipe_name: 'Chocolate Lava Cake', description: 'Rich chocolate cake with molten center, served with vanilla ice cream' }
];

export async function seedDishRecipes() {
  try {
    console.log("🍽️ Seeding dish recipes...");

    // First, clear existing data
    await sql`TRUNCATE TABLE dish_recipes RESTART IDENTITY CASCADE`;

    // Get all cabin crew IDs from database (ordered by insertion order)
    const cabinCrew = await sql`
      SELECT id FROM cabin_crew ORDER BY id ASC
    `;
    const cabinCrewIds = cabinCrew.map(cc => cc.id);

    // Insert all dish recipes using actual database IDs
    for (const recipe of SAMPLE_DISH_RECIPES) {
      const actualChefId = cabinCrewIds[recipe.chef_index - 1]; // Convert 1-based index to 0-based array index
      
      if (!actualChefId) {
        console.error(`❌ Chef ID ${recipe.chef_index} not found (only ${cabinCrewIds.length} crew members exist)`);
        continue;
      }

      await sql`
        INSERT INTO dish_recipes (chef_id, recipe_name, description)
        VALUES (${actualChefId}, ${recipe.recipe_name}, ${recipe.description})
      `;
    }

    console.log("✅ Dish recipes seeded successfully");

  } catch (error) {
    console.error("❌ Error seeding dish recipes:", error);
    throw error;
  }
}

