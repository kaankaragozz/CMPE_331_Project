import { sql } from '../../config/db.js';

export async function seedInfants() {
  console.log("👶 Seeding infant-parent relationships...");

  try {
    // Get IDs
    const passengers = await sql`SELECT passenger_id, name FROM passengers`;
    const pMap = {};
    passengers.forEach(p => pMap[p.name] = p.passenger_id);

    const FLIGHT_IST_FRA = 'AA1001';

    const relationships = [
      // Bebek Yilmaz -> Ayse Yilmaz (Mother)
      { infant: 'Bebek Yilmaz', parent: 'Ayse Yilmaz', flight: FLIGHT_IST_FRA }
    ];

    for (const rel of relationships) {
      const infantID = pMap[rel.infant];
      const parentID = pMap[rel.parent];

      if (infantID && parentID) {
        await sql`
          INSERT INTO infant_parent_relationship (infant_passenger_id, parent_passenger_id, flight_number)
          VALUES (${infantID}, ${parentID}, ${rel.flight})
        `;
      }
    }
    console.log("✅ Infant relationships seeded successfully.");

  } catch (error) {
    console.error("❌ Error seeding infants:", error);
    throw error;
  }
}

seedInfants();
