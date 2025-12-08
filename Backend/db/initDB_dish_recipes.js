import { sql } from "../config/db.js";

export async function initDB_dish_recipes() {
  try {
    // Create dish_recipes table
    await sql`
      CREATE TABLE IF NOT EXISTS dish_recipes (
        id SERIAL PRIMARY KEY,
        chef_id INTEGER NOT NULL REFERENCES cabin_crew(id),
        recipe_name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ DataBase dish_recipes initialized successfully");
  } catch (error) {
    console.log("❌ Error initDB_dish_recipes", error);
  }
}
