import { initDB_affiliated_seating } from './initDB_affiliated_seating.js';
import { initDB_flight_passenger_assignments } from './initDB_flight_passenger_assignments.js';
import { initDB_infant_parent_relationship } from './initDB_infant_parent_relationship.js';
import { initDB_passengers } from './initDB_passengers.js';
import { initDB_seat_type } from './initDB_seat_type.js';
import { vehicle_types } from './initDB_vehicle_types.js';
import { flights } from './initDB_flights.js';



export async function initDB() {
  try {
    // Await each async table creation
    await initDB_affiliated_seating();
    await initDB_flight_passenger_assignments();
    await initDB_infant_parent_relationship();
    await initDB_passengers();
    await initDB_seat_type();
    await vehicle_types();
    await flights();

    

    console.log("✅ Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}