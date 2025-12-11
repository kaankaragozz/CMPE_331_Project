import { sql } from '../../config/db.js';

// Initialize database schema
export async function initDB_passengers() {
  try {
    
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

    console.log("✅ Database passengers initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing passengers database:", error);
  }
}

export async function dropPassengersTable() {
  try {
    await sql`DROP TABLE IF EXISTS passengers CASCADE`;
    console.log('🗑️  `passengers` table dropped');
    return true;
  } catch (error) {
    console.error('❌ Error dropping passengers table:', error);
    throw error;
  }
}