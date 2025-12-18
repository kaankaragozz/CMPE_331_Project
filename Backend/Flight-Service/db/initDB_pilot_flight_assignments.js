import { sql } from "../config/db.js";

export async function initDB_pilot_flight_assignments() {
  try {
    console.log("📋 Ensuring flight_crew_assignments table exists...");

    await sql`
      CREATE TABLE IF NOT EXISTS flight_crew_assignments (
        flight_id INTEGER PRIMARY KEY REFERENCES flights(id) ON DELETE CASCADE,
        pilot_ids INTEGER[] NOT NULL,
        cabin_crew_ids INTEGER[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("  ✅ flight_crew_assignments table ready");
  } catch (error) {
    console.error("❌ Error creating flight_crew_assignments table:", error);
    throw error;
  }
}
