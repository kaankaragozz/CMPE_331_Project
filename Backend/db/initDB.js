import { initFlightInfoTables } from './FlightInfoDb.js';

// Initialize database schema
export async function initDB() {
  try {
    console.log("🗄️  Initializing database schema...\n");

    // Initialize all flight information tables
    await initFlightInfoTables();

    console.log("\n✅ Database initialization completed successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

