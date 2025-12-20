import { sql } from '../config/db.js';

export async function initDB_Flight_Recipe() {
  try {
    console.log('📍 Creating `flight_recipe` table...');

    await sql`
      CREATE TABLE IF NOT EXISTS flight_recipe (
        id SERIAL PRIMARY KEY,
        flight_id INT NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
        crew_id INT NOT NULL REFERENCES cabin_crew(id) ON DELETE CASCADE,
        recipe_id INT NOT NULL REFERENCES dish_recipes(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(flight_id)  -- ensures only one recipe per flight
      );
    `;

    console.log('  ✅ `flight_recipe` table ensured');
    return true;
  } catch (error) {
    console.error('❌ Error creating flight_recipe table:', error);
    throw error;
  }
}

export async function dropFlightRecipesTable() {
  try {
    await sql`DROP TABLE IF EXISTS flight_recipe CASCADE`;
    console.log('🗑️  `flight_recipe` table dropped');
    return true;
  } catch (error) {
    console.error('❌ Error dropping flight_recipe table:', error);
    throw error;
  }
}