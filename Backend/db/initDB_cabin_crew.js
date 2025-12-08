import { sql } from "../config/db.js";

export async function initDB_cabin_crew() {
  try {
    // Create cabin_crew table
    await sql`
      CREATE TABLE IF NOT EXISTS cabin_crew (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        age INTEGER NOT NULL,
        gender VARCHAR(10) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        known_languages TEXT[] NOT NULL,
        attendant_type_id INTEGER NOT NULL REFERENCES attendant_types(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ DataBase cabin_crew initialized successfully");
  } catch (error) {
    console.log("❌ Error initDB_cabin_crew", error);
  }
}
