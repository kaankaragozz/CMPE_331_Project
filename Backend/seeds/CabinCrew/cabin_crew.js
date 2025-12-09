import { sql } from "../../config/db.js";

const SAMPLE_CABIN_CREW = [

];


async function seedDatabase() {
  try {
    // first, clear existing data
    await sql`TRUNCATE TABLE   RESTART IDENTITY`;

    // insert all 
    for (const of ) {
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