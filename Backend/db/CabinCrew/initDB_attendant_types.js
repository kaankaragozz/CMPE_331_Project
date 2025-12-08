import { sql } from "../../config/db.js";

export async function initDB_attendant_types() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS attendant_types (
        id SERIAL PRIMARY KEY,
        type_name VARCHAR(50) UNIQUE NOT NULL,
        min_count INTEGER NOT NULL,
        max_count INTEGER NOT NULL
      )
    `;
    console.log(" DataBase attendant_types initialized successfully");
  } catch (error) {
    console.log(" Error initDB_attendant_types", error);
  }
}
