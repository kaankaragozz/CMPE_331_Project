import { sql } from "../../config/db.js";

export async function initDB_users() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'Passenger',

        last_login TIMESTAMP NULL,
        is_verified BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("✅ Users table ready");
  } catch (error) {
    console.error("❌ Error creating users table:", error);
  }
}