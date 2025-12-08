import { sql } from "../config/db.js";

export async function initDB_flights() {
  try {
    // Create flights table
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
    console.log("✅ DataBase flights initialized successfully")
  } catch (error) {
    console.log("❌ Error initDB_flights", error);
  }
};