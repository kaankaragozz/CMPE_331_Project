import { sql } from "../config/db.js";

const SAMPLE_ATTENDANT_TYPES = [
  { type_name: 'flight_attendant', min_count: 4, max_count: 8 },
  { type_name: 'senior_flight_attendant', min_count: 1, max_count: 2 },
  { type_name: 'chef', min_count: 1, max_count: 2 },
  { type_name: 'purser', min_count: 1, max_count: 1 }
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

