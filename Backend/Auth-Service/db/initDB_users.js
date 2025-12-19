import { sql } from "../config/db.js";

export async function initDB_users() {
  try {
    // Create table if it doesn't exist yet
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'Passenger',

        pilot_id INTEGER NULL,  -- optional link to pilots table
        cabin_crew_id INTEGER NULL,  -- optional link to cabincrew table

        last_login TIMESTAMP NULL,
        is_verified BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure pilot_id column exists on older DBs
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS pilot_id INTEGER
    `;

    console.log("✅ Users table ready");
  } catch (error) {
    console.error("❌ Error creating users table:", error);
  }
}
