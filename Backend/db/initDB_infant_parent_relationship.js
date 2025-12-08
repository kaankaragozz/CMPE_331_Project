import { sql } from '../config/db.js';

// Initialize database schema
export async function initDB_infant_parent_relationship() {
  try {

    // Create infant_parent_relationship table
    await sql`
      CREATE TABLE IF NOT EXISTS infant_parent_relationship (
        id SERIAL PRIMARY KEY,
        infant_passenger_id INTEGER NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE,
        flight_number VARCHAR(6) NOT NULL,
        parent_passenger_id INTEGER NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE
      )
    `;


    console.log("✅ Database infant_parent_relationship initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing infant_parent_relationship database:", error);
  }
}