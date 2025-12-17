// Backend/Flight-Service/scripts/createFlightCrewAssignmentsTable.js
import { sql } from "../config/db.js";

async function main() {
  try {
    console.log("Dropping table flight_crew_assignments if it exists...");
    await sql`DROP TABLE IF EXISTS flight_crew_assignments CASCADE`;

    console.log("Creating table flight_crew_assignments...");
    await sql`
      CREATE TABLE flight_crew_assignments (
        id SERIAL PRIMARY KEY,
        flight_id INTEGER NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
        pilot_ids INTEGER[] NOT NULL,
        cabin_crew_ids INTEGER[] NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_flight_assignment UNIQUE (flight_id)
      )
    `;

    console.log("✅ flight_crew_assignments table created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating flight_crew_assignments table:", err);
    process.exit(1);
  }
}

main();
