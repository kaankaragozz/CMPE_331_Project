import { sql } from '../../config/db.js';

export async function seedAffiliations() {
  console.log("🔗 Seeding affiliations (Family/Groups)...");

  try {
    // Get IDs by name again
    const passengers = await sql`SELECT passenger_id, name FROM passengers`;
    const pMap = {};
    passengers.forEach(p => pMap[p.name] = p.passenger_id);

    const FLIGHT_IST_FRA = 'AA1001';
    const FLIGHT_IST_JFK = 'AA1002';

    const affiliations = [
      // Yilmaz Family (Husband <-> Wife)
      { p1: 'Ahmet Yilmaz', p2: 'Ayse Yilmaz', flight: FLIGHT_IST_FRA },

      // Smith Family (Husband <-> Wife)
      { p1: 'John Smith', p2: 'Sarah Smith', flight: FLIGHT_IST_JFK },

      // Smith Family (Mother <-> Child)
      { p1: 'Sarah Smith', p2: 'Mike Smith', flight: FLIGHT_IST_JFK }
    ];

    for (const aff of affiliations) {
      const p1ID = pMap[aff.p1];
      const p2ID = pMap[aff.p2];

      if (p1ID && p2ID) {
        await sql`
          INSERT INTO affiliated_seating (main_passenger_id, affiliated_passenger_id, flight_number)
          VALUES (${p1ID}, ${p2ID}, ${aff.flight})
        `;
      }
    }
    console.log("✅ Affiliations seeded successfully.");

  } catch (error) {
    console.error("❌ Error seeding affiliations:", error);
    throw error;
  }
}

seedAffiliations();
