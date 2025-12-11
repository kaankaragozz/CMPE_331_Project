import { sql } from '../../config/db.js';

export const initDB_pilots = async () => {
  try {
    console.log('Creating pilots table...');
    
    // FIX: SQL query syntax corrected to use tagged template literal (sql`...`)
    await sql`
      CREATE TABLE IF NOT EXISTS pilots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL,
        gender VARCHAR(50) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        vehicle_restriction VARCHAR(100) NOT NULL,
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