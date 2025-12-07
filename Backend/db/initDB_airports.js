import { sql } from "../config/db.js";

export async function initDB_airports() {
  try {
    // Create airports table
    await sql`
      CREATE TABLE IF NOT EXISTS airports (
        id SERIAL PRIMARY KEY,
        code VARCHAR(3) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ DataBase airports initialized successfully")
  } catch (error) {
    console.log("❌ Error initDB_airports", error);
  }
};