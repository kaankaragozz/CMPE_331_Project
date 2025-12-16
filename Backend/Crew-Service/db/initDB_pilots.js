import { sql } from '../config/db.js';

const initDB_pilots = async () => {
  try {
    console.log('Creating pilots table...');

    // Drop table if exists to ensure correct schema (vehicle_type_id foreign key)
    await sql`DROP TABLE IF EXISTS pilots CASCADE`;

    // Create table with correct schema using vehicle_type_id foreign key
    await sql`
      CREATE TABLE IF NOT EXISTS pilots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL,
        gender VARCHAR(50) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        vehicle_type_id INTEGER NOT NULL REFERENCES vehicle_types(id) ON DELETE RESTRICT,
        allowed_range INTEGER NOT NULL,
        seniority_level VARCHAR(50) NOT NULL CHECK (seniority_level IN ('Senior', 'Junior', 'Trainee')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Pilots table created');
  } catch (error) {
    // Log error if table creation fails
    console.error('Error initializing pilots table:', error);
    throw error;
  }
};

// Alias used by the database initialization orchestrator (initDB.js)
export const createPilotsTable = initDB_pilots;