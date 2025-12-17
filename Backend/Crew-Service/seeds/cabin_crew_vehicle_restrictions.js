import { sql } from "../config/db.js";


const SAMPLE_CABIN_CREW_VEHICLE_RESTRICTIONS = [
  { cabin_crew_id: 1, vehicle_type_id: 1 },
  { cabin_crew_id: 1, vehicle_type_id: 2 },
  { cabin_crew_id: 2, vehicle_type_id: 1 },
  { cabin_crew_id: 3, vehicle_type_id: 1 },
  { cabin_crew_id: 3, vehicle_type_id: 2 },
  { cabin_crew_id: 3, vehicle_type_id: 3 },
  { cabin_crew_id: 4, vehicle_type_id: 2 },
  { cabin_crew_id: 5, vehicle_type_id: 1 },
  { cabin_crew_id: 6, vehicle_type_id: 1 },
  { cabin_crew_id: 6, vehicle_type_id: 2 },
  { cabin_crew_id: 6, vehicle_type_id: 3 }
];

export async function seedCabinCrewVehicleRestrictions() {
  try {
    console.log("🚫 Seeding cabin crew vehicle restrictions...");

    // First, clear existing data
    await sql`TRUNCATE TABLE cabin_crew_vehicle_restrictions RESTART IDENTITY CASCADE`;

    // Get all cabin crew IDs from database (ordered by insertion order)
    const cabinCrew = await sql`
      SELECT id FROM cabin_crew ORDER BY id ASC
    `;

    // Map the hardcoded indices to actual database IDs
    // SAMPLE_CABIN_CREW_VEHICLE_RESTRICTIONS uses indices 1-6, which should map to IDs 1-6 after TRUNCATE RESTART IDENTITY
    const cabinCrewIds = cabinCrew.map(cc => cc.id);

    // Insert all restrictions using actual database IDs
    for (const restriction of SAMPLE_CABIN_CREW_VEHICLE_RESTRICTIONS) {
      const actualCabinCrewId = cabinCrewIds[restriction.cabin_crew_id - 1]; // Convert 1-based index to 0-based array index
      
      if (!actualCabinCrewId) {
        console.error(`❌ Cabin crew ID ${restriction.cabin_crew_id} not found (only ${cabinCrewIds.length} crew members exist)`);
        continue;
      }

      await sql`
        INSERT INTO cabin_crew_vehicle_restrictions (cabin_crew_id, vehicle_type_id)
        VALUES (${actualCabinCrewId}, ${restriction.vehicle_type_id})
        ON CONFLICT (cabin_crew_id, vehicle_type_id) DO NOTHING
      `;
    }

    console.log("✅ Cabin crew vehicle restrictions seeded successfully");

  } catch (error) {
    console.error("❌ Error seeding cabin crew vehicle restrictions:", error);
    throw error;
  }
}

