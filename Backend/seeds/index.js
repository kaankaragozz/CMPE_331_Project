import { initDB } from '../db/initDB.js';
import { seedVehicleTypes } from './seed_vehicle_types.js';
import { seedAirports } from './seed_airports.js';
import { seedFlights } from './seed_flights.js';

async function seedData() {
  try {
    console.log("🌱 Starting database seeding...");

    // Initialize database tables first
    await initDB();

    // Seed each table in order
    await seedVehicleTypes();
    await seedAirports();
    await seedFlights();

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedData();

