import { sql } from "../config/db.js";

export async function vehicle_types() {
  try {
    await sql`
        CREATE TABLE IF NOT EXISTS vehicle_types (
          id SERIAL PRIMARY KEY,
          type_name VARCHAR(100) NOT NULL UNIQUE,
          total_seats INTEGER NOT NULL,
          seating_plan JSONB NOT NULL,
          max_crew INTEGER NOT NULL,
          max_passengers INTEGER NOT NULL,
          menu_description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

    console.log("✅ DataBase vehicle_types initialized successfully")
  } catch (error) {
    console.log("❌ Error initDB_vehicle_types", error);
  }
}