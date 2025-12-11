/* 
import { sql } from '../config/db.js';

// Initialize database schema
export async function initDB_flight_passengers_assignments() {
  try {

    // Create flight_passenger_assignments table
    await sql`
      CREATE TABLE IF NOT EXISTS flight_passenger_assignments (
        id SERIAL PRIMARY KEY,
        passenger_id INTEGER NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE,
        flight_number VARCHAR(6) NOT NULL,
        seat_type_id INTEGER REFERENCES seat_type(seat_type_id),
        seat_number VARCHAR(5),
        is_infant BOOLEAN DEFAULT FALSE,
        UNIQUE(passenger_id, flight_number)
      )
    `;

    console.log("✅ Database flight_passenger_assignments initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing flight_passenger_assignments database:", error);
  }
}
*/