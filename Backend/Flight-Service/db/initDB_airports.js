import { sql } from '../../config/db.js';

export async function initAirportsTable() {
  try {
    console.log('📍 Creating `airports` table...');

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

    console.log('  ✅ `airports` table ensured');
    return true;
  } catch (error) {
    console.error('❌ Error creating airports table:', error);
    throw error;
  }
}

export async function dropAirportsTable() {
  try {
    await sql`DROP TABLE IF EXISTS airports CASCADE`;
    console.log('🗑️  `airports` table dropped');
    return true;
  } catch (error) {
    console.error('❌ Error dropping airports table:', error);
    throw error;
  }
}
