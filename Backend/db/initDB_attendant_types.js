import { sql } from "../config/db.js";

export async function initDB_attendant_types() {
  try {
    // Create attendant_types table
    await sql`
      CREATE TABLE IF NOT EXISTS attendant_types (
        id SERIAL PRIMARY KEY,
        type_name VARCHAR(50) NOT NULL UNIQUE,
        min_count INTEGER NOT NULL,
        max_count INTEGER NOT NULL
      )
    `;
    console.log("✅ DataBase attendant_types initialized successfully");
  } catch (error) {
    console.log("❌ Error initDB_attendant_types", error);
  }
}
