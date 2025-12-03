import { initDB } from '../db/initDB.js';
import { seedAllFlightData } from '../db/FlightInfoSeeds.js';

async function seedData() {
  try {
    // Initialize database tables first
    await initDB();

    // Seed all flight data (airports, vehicle types, flights)
    await seedAllFlightData();

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during database seeding:", error);
    process.exit(1);
  }
}

seedData();

