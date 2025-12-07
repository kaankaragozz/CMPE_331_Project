import { initAirportsTable } from './initDB_airports.js';
import { initVehicleTypesTable } from './initDB_vehicle_types.js';
import { initFlightsTable } from './initDB_flights.js';

// Initialize database schema by calling modular init functions
export async function initDB() {
  try {
    console.log('🗄️  Initializing database schema...\n');

    // Ensure tables are created in dependency order
    await initAirportsTable();
    await initVehicleTypesTable();
    await initFlightsTable();

    console.log('\n✅ Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

