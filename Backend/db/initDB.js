import pg from 'pg';

const pool = new pg.Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
  ssl: { rejectUnauthorized: false }, // NeonDB için SSL gerekli
});

export async function initDB() {
  try {
    console.log('🔍 Veritabanı bağlantısı test ediliyor...');
    const client = await pool.connect();
    console.log('✅ Veritabanına başarıyla bağlanıldı!');

    // Create vehicle_types table
    await client.query(`
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
    `);

    // Create airports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS airports (
        id SERIAL PRIMARY KEY,
        code VARCHAR(3) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create flights table
    await client.query(`
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
    `);

    // Create index on flight_number for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flights_flight_number ON flights(flight_number)
    `);

    // Create index on flight_date for date-based queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flights_flight_date ON flights(flight_date)
    `);

    // Create attendant_types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendant_types (
        id SERIAL PRIMARY KEY,
        type_name VARCHAR(50) NOT NULL UNIQUE,
        min_count INTEGER NOT NULL,
        max_count INTEGER NOT NULL
      )
    `);

    // Create cabin_crew table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cabin_crew (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        age INTEGER NOT NULL,
        gender VARCHAR(10) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        known_languages TEXT[] NOT NULL,
        attendant_type_id INTEGER NOT NULL REFERENCES attendant_types(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create dish_recipes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dish_recipes (
        id SERIAL PRIMARY KEY,
        chef_id INTEGER NOT NULL REFERENCES cabin_crew(id),
        recipe_name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cabin_crew_vehicle_restrictions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cabin_crew_vehicle_restrictions (
        id SERIAL PRIMARY KEY,
        cabin_crew_id INTEGER NOT NULL REFERENCES cabin_crew(id),
        vehicle_type_id INTEGER NOT NULL REFERENCES vehicle_types(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    client.release();
    console.log("✅ Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

export { pool };

