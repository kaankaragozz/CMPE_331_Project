import { sql } from '../config/db.js';

// Initialize database schema
export async function initDB() {
  try {
    console.log("🔄 Initializing Database Schema...");

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

    // Create seat_type table
    await sql`
      CREATE TABLE IF NOT EXISTS seat_type (
        seat_type_id SERIAL PRIMARY KEY,
        type_name VARCHAR(50) NOT NULL UNIQUE
      )
    `;

    // Seed seat_type table with 'Business' and 'Economy'
    const seatTypes = await sql`SELECT COUNT(*) FROM seat_type`;
    if (parseInt(seatTypes[0].count) === 0) {
      await sql`
        INSERT INTO seat_type (type_name) VALUES ('Business'), ('Economy')
      `;
      console.log("ℹ️ Seeded seat_type table with 'Business' and 'Economy'.");
    }

    // Create passengers table (Core Entity)
    await sql`
      CREATE TABLE IF NOT EXISTS passengers (
        passenger_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL,
        gender VARCHAR(50),
        nationality VARCHAR(100)
      )
    `;

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

    // Create affiliated_seating table
    await sql`
      CREATE TABLE IF NOT EXISTS affiliated_seating (
        id SERIAL PRIMARY KEY,
        main_passenger_id INTEGER NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE,
        flight_number VARCHAR(6) NOT NULL,
        affiliated_passenger_id INTEGER NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE
      )
    `;

    // Create infant_parent_relationship table
    await sql`
      CREATE TABLE IF NOT EXISTS infant_parent_relationship (
        id SERIAL PRIMARY KEY,
        infant_passenger_id INTEGER NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE,
        flight_number VARCHAR(6) NOT NULL,
        parent_passenger_id INTEGER NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE
      )
    `;

    console.log("✅ Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}