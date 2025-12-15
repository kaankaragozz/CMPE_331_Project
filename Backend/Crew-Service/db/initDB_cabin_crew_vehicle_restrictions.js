import { sql } from "../../config/db.js";
import { initVehicleTypesTable } from "../../db/Flight/initDB_vehicle_types.js";

export async function initDB_cabin_crew_vehicle_restrictions() {
  try {
    await initVehicleTypesTable();
    await sql`
      CREATE TABLE IF NOT EXISTS cabin_crew_vehicle_restrictions (
        id SERIAL PRIMARY KEY,
        cabin_crew_id INTEGER NOT NULL REFERENCES cabin_crew(id) ON DELETE CASCADE,
        vehicle_type_id INTEGER NOT NULL REFERENCES vehicle_types(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(cabin_crew_id, vehicle_type_id)
      )
    `;
    console.log(" DataBase cabin_crew_vehicle_restrictions initialized successfully");
  } catch (error) {
    console.log(" Error initDB_cabin_crew_vehicle_restrictions", error);
  }
}
