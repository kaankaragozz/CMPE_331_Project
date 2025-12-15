import { sql } from "../config/db.js";

const SAMPLE_DISH_RECIPES = [
  { chef_id: 5, recipe_name: 'Mediterranean Salmon', description: 'Grilled salmon with olive oil, lemon, and fresh herbs' },
  { chef_id: 5, recipe_name: 'Beef Wellington', description: 'Classic beef tenderloin wrapped in puff pastry with mushroom duxelles' },
  { chef_id: 5, recipe_name: 'Vegetarian Lasagna', description: 'Layered pasta with ricotta, spinach, and marinara sauce' },
  { chef_id: 5, recipe_name: 'Thai Green Curry', description: 'Aromatic curry with coconut milk, vegetables, and jasmine rice' },
  { chef_id: 5, recipe_name: 'Chocolate Lava Cake', description: 'Rich chocolate cake with molten center, served with vanilla ice cream' }
];

export async function seedDishRecipes() {
  try {
    console.log("🍽️ Seeding dish recipes...");

    // first, clear existing data
    await sql`TRUNCATE TABLE dish_recipes RESTART IDENTITY CASCADE`;

    // insert all dish recipes
    for (const recipe of SAMPLE_DISH_RECIPES) {
      await sql`
        INSERT INTO dish_recipes (chef_id, recipe_name, description)
        VALUES (${recipe.chef_id}, ${recipe.recipe_name}, ${recipe.description})
      `;
    }

    console.log("✅ Dish recipes seeded successfully");

  } catch (error) {
    console.error("❌ Error seeding dish recipes:", error);

  }
}

