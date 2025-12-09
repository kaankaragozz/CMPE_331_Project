import { sql } from '../../config/db.js';

export async function initFlightsTable() {
  try {
    console.log('📍 Creating `flights` table...');

    await sql`
      CREATE TABLE IF NOT EXISTS flights (
        id SERIAL PRIMARY KEY,
        flight_number VARCHAR(6) NOT NULL UNIQUE,
        flight_date TIMESTAMP NOT NULL,
        duration_minutes INTEGER NOT NULL,
        distance_km DECIMAL(10, 2) NOT NULL,
        source_airport_id INTEGER NOT NULL REFERENCES airports(id),
        destination_airport_id INTEGER NOT NULL REFERENCES airports(id),
        vehicle_type_id INTEGER NOT NULL REFERENCES vehicle_types(id),
        is_shared BOOLEAN DEFAULT FALSE,
        shared_flight_number VARCHAR(6),
        shared_airline_name VARCHAR(255),
        connecting_flight_info JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_flights_flight_number ON flights(flight_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_flights_flight_date ON flights(flight_date)`;

    console.log('  ✅ `flights` table and indexes ensured');
    return true;
  } catch (error) {
    console.error('❌ Error creating flights table:', error);
    throw error;
  }
}

export async function dropFlightsTable() {
  try {
    await sql`DROP TABLE IF EXISTS flights CASCADE`;
    console.log('🗑️  `flights` table dropped');
    return true;
  } catch (error) {
    console.error('❌ Error dropping flights table:', error);
    throw error;
  }
}
