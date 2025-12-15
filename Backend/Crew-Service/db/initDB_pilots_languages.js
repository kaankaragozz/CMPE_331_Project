import { sql } from '../config/db.js';

// Main function to initialize both languages and pilot_languages tables (used if called directly)
export const initDB_languages = async () => {
  try {
    console.log('Creating languages table...');
    // FIX: SQL query syntax corrected to use tagged template literal (sql`...`)
    await sql`
      CREATE TABLE IF NOT EXISTS languages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Languages table created');

    console.log('Creating pilot_languages junction table...');
    // FIX: SQL query syntax corrected to use tagged template literal (sql`...`)
    await sql`
      CREATE TABLE IF NOT EXISTS pilot_languages (
        pilot_id INTEGER NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
        language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (pilot_id, language_id)
      )
    `;
    console.log('✓ Pilot_languages junction table created');
  } catch (error) {
    console.error('Error initializing languages tables:', error);
    throw error;
  }
};

// Export individual table creation functions for explicit control in the orchestrator (initDB.js)

export const createLanguagesTable = async () => {
  try {
    // FIX: SQL query syntax corrected to use tagged template literal (sql`...`)
    await sql`
      CREATE TABLE IF NOT EXISTS languages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Languages table created');
  } catch (error) {
    console.error('Error creating languages table:', error);
    throw error;
  }
};

export const createPilotLanguagesTable = async () => {
  try {
    // FIX: SQL query syntax corrected to use tagged template literal (sql`...`)
    await sql`
      CREATE TABLE IF NOT EXISTS pilot_languages (
        pilot_id INTEGER NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
        language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (pilot_id, language_id)
      )
    `;
    console.log('✓ Pilot_languages junction table created');
  } catch (error) {
    console.error('Error creating pilot_languages table:', error);
    throw error;
  }
};