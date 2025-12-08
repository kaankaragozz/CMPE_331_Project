import { sql } from "../../config/db.js";

const SAMPLE_AIRPORTS = [

];

async function seedDatabase() {
  try {
    // first, clear existing data
    await sql`TRUNCATE TABLE airports RESTART IDENTITY`;

    // insert all airports
    for (const airports of SAMPLE_PASSENGERS) {
      await sql`
        INSERT INTO  (, , , , , )
        VALUES (${.}, ${.}, ${}, ${}, ${}, ${})
      `;
    }

    console.log("Passengers Database seeded successfully");
    process.exit(0); // success code
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1); // failure code
  }
}

seedDatabase(); 