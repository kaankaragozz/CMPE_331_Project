import { sql } from "../config/db.js";
import { seedVehicleTypes } from "../Flight-Service/seeds/vehicle_types.js";

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
    await seedVehicleTypes();
    console.log("🚫 Seeding cabin crew vehicle restrictions...");

    // first, clear existing data
    await sql`TRUNCATE TABLE cabin_crew_vehicle_restrictions RESTART IDENTITY CASCADE`;

    // insert all restrictions
    for (const restriction of SAMPLE_CABIN_CREW_VEHICLE_RESTRICTIONS) {
      await sql`
        INSERT INTO cabin_crew_vehicle_restrictions (cabin_crew_id, vehicle_type_id)
        VALUES (${restriction.cabin_crew_id}, ${restriction.vehicle_type_id})
      `;
    }

    console.log("✅ Cabin crew vehicle restrictions seeded successfully");

  } catch (error) {
    console.error("❌ Error seeding cabin crew vehicle restrictions:", error);

  }
}

