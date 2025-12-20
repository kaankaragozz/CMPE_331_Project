import { sql } from '../config/db.js';

export async function initCompaniesTable() {
  try {
    console.log('📍 Creating `companies` table...');

    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        code VARCHAR(2) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index on code for faster lookups
    await sql`CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(code)`;

    console.log('  ✅ `companies` table and indexes ensured');
    return true;
  } catch (error) {
    console.error('❌ Error creating companies table:', error);
    throw error;
  }
}

export async function dropCompaniesTable() {
  try {
    await sql`DROP TABLE IF EXISTS companies CASCADE`;
    console.log('🗑️  `companies` table dropped');
    return true;
  } catch (error) {
    console.error('❌ Error dropping companies table:', error);
    throw error;
  }
}

