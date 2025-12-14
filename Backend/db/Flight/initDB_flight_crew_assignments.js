// Backend/db/Flight/initDB_flight_crew_assignments.js
import { sql } from '../../config/db.js';

export async function initFlightCrewAssignmentsTables() {
  try {
    console.log('📍 Creating flight crew assignment tables...');

    // Pilot assignments to flights
    await sql`
      CREATE TABLE IF NOT EXISTS flight_pilot_assignments (
        id SERIAL PRIMARY KEY,
        flight_id INTEGER NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
        pilot_id INTEGER NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
        role_in_flight VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(flight_id, pilot_id)
      )
    `;

    // Cabin crew assignments to flights
    await sql`
      CREATE TABLE IF NOT EXISTS flight_cabin_crew_assignments (
        id SERIAL PRIMARY KEY,
        flight_id INTEGER NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
        cabin_crew_id INTEGER NOT NULL REFERENCES cabin_crew(id) ON DELETE CASCADE,
        role_in_flight VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(flight_id, cabin_crew_id)
      )
    `;

    console.log('✅ flight crew assignment tables ensured');
  } catch (error) {
    console.error('❌ Error creating flight crew assignment tables:', error);
    throw error;
  }
}
