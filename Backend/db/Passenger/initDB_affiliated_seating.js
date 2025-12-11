import { sql } from '../../config/db.js';

// Initialize database schema
export async function initDB_affiliated_seating() {
  try {

    // Create affiliated_seating table
    await sql`
      CREATE TABLE IF NOT EXISTS affiliated_seating (
        id SERIAL PRIMARY KEY,
        main_passenger_id INTEGER NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE,
        flight_number VARCHAR(6) NOT NULL,
        affiliated_passenger_id INTEGER NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE
      )
    `;

    console.log("✅ Database affiliated_seating initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing affiliated_seating database:", error);
  }
}

export async function dropAffiliatedSeatingTable() {
  try {
    await sql`DROP TABLE IF EXISTS affiliated_seating CASCADE`;
    console.log('🗑️  `affiliated_seating` table dropped');
    return true;
  } catch (error) {
    console.error('❌ Error dropping affiliated_seating table:', error);
    throw error;
  }
}