import { sql } from "../../config/db.js";

const SAMPLE_ATTENDANT_TYPES = [

];

async function seedDatabase() {
  try {
    // first, clear existing data
    await sql`TRUNCATE TABLE   RESTART IDENTITY`;

    // insert all 
    for (const attendant_types of SAMPLE_ATTENDANT_TYPES) {
      await sql`
        
      `;
    }

    console.log(" Database seeded successfully");
    process.exit(0); // success code
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1); // failure code
  }
}

seedDatabase();