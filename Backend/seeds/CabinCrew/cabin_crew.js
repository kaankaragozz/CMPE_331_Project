import { sql } from "../../config/db.js";
import { initDB_cabin_crew } from "../../db/CabinCrew/initDB_cabin_crew.js";

const SAMPLE_CABIN_CREW = [
  { first_name: 'Emma', last_name: 'Johnson', age: 28, gender: 'Female', nationality: 'American', known_languages: ['English', 'Spanish'], attendant_type_id: 1 },
  { first_name: 'Oliver', last_name: 'Smith', age: 32, gender: 'Male', nationality: 'British', known_languages: ['English', 'French'], attendant_type_id: 1 },
  { first_name: 'Sophia', last_name: 'Garcia', age: 35, gender: 'Female', nationality: 'Spanish', known_languages: ['Spanish', 'English', 'French'], attendant_type_id: 2 },
  { first_name: 'Liam', last_name: 'Brown', age: 29, gender: 'Male', nationality: 'Canadian', known_languages: ['English', 'French'], attendant_type_id: 1 },
  { first_name: 'Isabella', last_name: 'Martinez', age: 41, gender: 'Female', nationality: 'Mexican', known_languages: ['Spanish', 'English'], attendant_type_id: 3 },
  { first_name: 'Noah', last_name: 'Wilson', age: 38, gender: 'Male', nationality: 'Australian', known_languages: ['English'], attendant_type_id: 4 },
  { first_name: 'Mia', last_name: 'Anderson', age: 27, gender: 'Female', nationality: 'American', known_languages: ['English'], attendant_type_id: 1 },
  { first_name: 'Ethan', last_name: 'Taylor', age: 33, gender: 'Male', nationality: 'British', known_languages: ['English', 'German'], attendant_type_id: 1 }
];

async function seedDatabase() {
  try {
    console.log("👥 Seeding cabin crew...");

    // first, clear existing data
    await sql`TRUNCATE TABLE cabin_crew RESTART IDENTITY CASCADE`;

    // insert all cabin crew
    for (const crew of SAMPLE_CABIN_CREW) {
      await sql`
        INSERT INTO cabin_crew (first_name, last_name, age, gender, nationality, known_languages, attendant_type_id)
        VALUES (${crew.first_name}, ${crew.last_name}, ${crew.age}, ${crew.gender}, ${crew.nationality}, ${crew.known_languages}, ${crew.attendant_type_id})
      `;
    }

    console.log("✅ Cabin crew seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding cabin crew:", error);
    process.exit(1);
  }
}

seedDatabase();