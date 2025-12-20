import { sql } from "../config/db.js";

const SAMPLE_ATTENDANT_TYPES = [
  //Hakan
  { type_name: 'chief', min_count: 1, max_count: 1 }, // 1 chief 
  { type_name: 'senior_flight_attendant', min_count: 1, max_count: 4 },  //In each flight there should be 1-4 senior attendants
  { type_name: 'junior_flight_attendant', min_count: 4, max_count: 16 },  // In each flight there should be 4-16 junior attendants 
  { type_name: 'chef', min_count: 0, max_count: 2 },  // In each flight there should be 0-2 chefs
];

export async function seedAttendantTypes() {
  try {

    console.log("🧑‍✈️ Seeding attendant types...");

    // first, clear existing data
    await sql`TRUNCATE TABLE attendant_types RESTART IDENTITY CASCADE`;

    // insert all attendant types with conflict handling
    for (const attendant_type of SAMPLE_ATTENDANT_TYPES) {
      await sql`
        INSERT INTO attendant_types (type_name, min_count, max_count)
        VALUES (${attendant_type.type_name}, ${attendant_type.min_count}, ${attendant_type.max_count})
        ON CONFLICT (type_name) DO NOTHING
      `;
    }

    console.log("✅ Attendant types seeded successfully");

  } catch (error) {
    console.error("❌ Error seeding attendant types:", error);
    throw error;
  }
}

