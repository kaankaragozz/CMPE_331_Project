import { sql } from '../config/db.js';

export async function seedAssignments() {
  console.log("🎫 Seeding flight assignments...");

  try {
    // 1. Get Seat Types
    const seatTypes = await sql`SELECT seat_type_id, type_name FROM seat_type`;

    if (seatTypes.length === 0) {
      console.warn("⚠️ No seat types found! Run fixSeatTypes.js first.");
      return;
    }

    // Create a map: 'Business' -> ID, 'Economy' -> ID
    const typeMap = {};
    seatTypes.forEach(t => {
      if (t.type_name.toLowerCase().includes('business')) typeMap['Business'] = t.seat_type_id;
      else typeMap['Economy'] = t.seat_type_id;
    });

    // 2. Fetch all passengers to get their real IDs
    const allPassengers = await sql`SELECT passenger_id, name, age FROM passengers`;
    const pMap = {}; // Name -> ID map
    allPassengers.forEach(p => pMap[p.name] = p.passenger_id);

    const FLIGHT_IST_FRA = 'AA1001';
    const FLIGHT_IST_JFK = 'AA1002';

    const assignments = [
      // --- FLIGHT AA1001 (IST -> FRA) ---
      { name: 'Ahmet Yilmaz', flight: FLIGHT_IST_FRA, type: 'Economy', is_infant: false },
      { name: 'Ayse Yilmaz', flight: FLIGHT_IST_FRA, type: 'Economy', is_infant: false },
      { name: 'Can Yilmaz', flight: FLIGHT_IST_FRA, type: 'Economy', is_infant: false },
      { name: 'Bebek Yilmaz', flight: FLIGHT_IST_FRA, type: 'Economy', is_infant: true },
      { name: 'Hans Mueller', flight: FLIGHT_IST_FRA, type: 'Business', is_infant: false },
      { name: 'Elena Rossi', flight: FLIGHT_IST_FRA, type: 'Business', is_infant: false },

      // --- FLIGHT AA1002 (IST -> JFK) ---
      { name: 'John Smith', flight: FLIGHT_IST_JFK, type: 'Business', is_infant: false },
      { name: 'Sarah Smith', flight: FLIGHT_IST_JFK, type: 'Business', is_infant: false },
      { name: 'Mike Smith', flight: FLIGHT_IST_JFK, type: 'Business', is_infant: false },
      { name: 'Bruce Wayne', flight: FLIGHT_IST_JFK, type: 'Economy', is_infant: false },
      { name: 'Peter Parker', flight: FLIGHT_IST_JFK, type: 'Economy', is_infant: false },
      { name: 'Ali Vural', flight: FLIGHT_IST_JFK, type: 'Economy', is_infant: false },
      { name: 'Zeynep Demir', flight: FLIGHT_IST_JFK, type: 'Economy', is_infant: false }
    ];

    let count = 0;
    for (const assign of assignments) {
      const passengerId = pMap[assign.name];
      const seatTypeId = typeMap[assign.type];

      if (passengerId && seatTypeId) {
        await sql`
          INSERT INTO flight_passenger_assignments 
          (passenger_id, flight_number, seat_type_id, seat_number, is_infant)
          VALUES (
            ${passengerId}, 
            ${assign.flight}, 
            ${seatTypeId}, 
            NULL, 
            ${assign.is_infant}
          )
          ON CONFLICT (passenger_id, flight_number) DO NOTHING
        `;
        count++;
      }
    }
    console.log(`✅ ${count} assignments created/verified for flights ${FLIGHT_IST_FRA} and ${FLIGHT_IST_JFK}.`);

  } catch (error) {
    console.error("❌ Error seeding assignments:", error);
    throw error;
  }
}
