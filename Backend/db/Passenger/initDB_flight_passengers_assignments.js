import { sql } from '../../config/db.js';
import { initDB_seat_type } from './initDB_seat_type.js';

// Initialize database schema
export async function initDB_flight_passengers_assignments() {
  try {
    await initDB_seat_type();

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

export async function dropFlightPassengerAssignmentsTable() {
  try {
    await sql`DROP TABLE IF EXISTS flight_passenger_assignments CASCADE`;
    console.log('🗑️  `flight_passenger_assignments` table dropped');
    return true;
  } catch (error) {
    console.error('❌ Error dropping flight_passenger_assignments table:', error);
    throw error;
  }
}
