/*
import { sql } from '../config/db.js';

// Initialize database schema
export async function initDB_seat_type() {
  try {
    
    // Create seat_type table
    await sql`
      CREATE TABLE IF NOT EXISTS seat_type (
        seat_type_id SERIAL PRIMARY KEY,
        type_name VARCHAR(50) NOT NULL UNIQUE
      )
    `;

    console.log("✅ Database seat_type initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing seat_type database:", error);
  }
}
*/