import { sql } from '../config/db.js';

// Initialize database schema
export async function initDB() {
  try {
    // Create vehicle_types table
    await sql`
      CREATE TABLE IF NOT EXISTS vehicle_types (
        id SERIAL PRIMARY KEY,
        type_name VARCHAR(100) NOT NULL UNIQUE,
        total_seats INTEGER NOT NULL,
        seating_plan JSONB NOT NULL,
        max_crew INTEGER NOT NULL,
        max_passengers INTEGER NOT NULL,
        menu_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create airports table
    await sql`
      CREATE TABLE IF NOT EXISTS airports (
        id SERIAL PRIMARY KEY,
        code VARCHAR(3) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

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

    // Create index on flight_number for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_flights_flight_number ON flights(flight_number)
    `;

    // Create index on flight_date for date-based queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_flights_flight_date ON flights(flight_date)
    `;

    console.log("✅ Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

