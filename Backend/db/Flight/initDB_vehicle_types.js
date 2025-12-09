import { sql } from '../../config/db.js';

export async function initVehicleTypesTable() {
  try {
    console.log('📍 Creating `vehicle_types` table...');

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

    console.log('  ✅ `vehicle_types` table ensured');
    return true;
  } catch (error) {
    console.error('❌ Error creating vehicle_types table:', error);
    throw error;
  }
}

export async function dropVehicleTypesTable() {
  try {
    await sql`DROP TABLE IF EXISTS vehicle_types CASCADE`;
    console.log('🗑️  `vehicle_types` table dropped');
    return true;
  } catch (error) {
    console.error('❌ Error dropping vehicle_types table:', error);
    throw error;
  }
}
