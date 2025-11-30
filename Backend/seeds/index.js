import { sql } from '../config/db.js';
import { initDB } from '../db/initDB.js';

async function seedData() {
  try {
    console.log("🌱 Starting database seeding...");

    // Initialize database tables first
    await initDB();

    // Seed Vehicle Types (at least 3 different types)
    console.log("📦 Seeding vehicle types...");
    
    const vehicleTypes = [
      {
        type_name: 'Boeing 737-800',
        total_seats: 189,
        seating_plan: {
          economy: { rows: 29, seats_per_row: 6, total: 174 },
          business: { rows: 4, seats_per_row: 6, total: 15 }
        },
        max_crew: 8,
        max_passengers: 189,
        menu_description: 'Standard meal service with hot meals, snacks, and beverages'
      },
      {
        type_name: 'Airbus A320',
        total_seats: 180,
        seating_plan: {
          economy: { rows: 28, seats_per_row: 6, total: 168 },
          business: { rows: 3, seats_per_row: 4, total: 12 }
        },
        max_crew: 6,
        max_passengers: 180,
        menu_description: 'Light meal service with sandwiches, snacks, and beverages'
      },
      {
        type_name: 'Boeing 787 Dreamliner',
        total_seats: 242,
        seating_plan: {
          economy: { rows: 35, seats_per_row: 9, total: 231 },
          business: { rows: 4, seats_per_row: 7, total: 11 }
        },
        max_crew: 12,
        max_passengers: 242,
        menu_description: 'Premium meal service with multi-course meals, premium beverages, and snacks'
      }
    ];

    for (const vehicle of vehicleTypes) {
      await sql`
        INSERT INTO vehicle_types (type_name, total_seats, seating_plan, max_crew, max_passengers, menu_description)
        VALUES (
          ${vehicle.type_name},
          ${vehicle.total_seats},
          ${JSON.stringify(vehicle.seating_plan)}::JSONB,
          ${vehicle.max_crew},
          ${vehicle.max_passengers},
          ${vehicle.menu_description}
        )
        ON CONFLICT (type_name) DO NOTHING
      `;
    }

    // Seed Airports
    console.log("✈️ Seeding airports...");
    
    const airports = [
      { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
      { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
      { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
      { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
      { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' }
    ];

    for (const airport of airports) {
      await sql`
        INSERT INTO airports (code, name, city, country)
        VALUES (${airport.code}, ${airport.name}, ${airport.city}, ${airport.country})
        ON CONFLICT (code) DO NOTHING
      `;
    }

    // Get vehicle type IDs for flights
    const vehicleTypeIds = await sql`
      SELECT id, type_name FROM vehicle_types ORDER BY id
    `;

    // Get airport IDs
    const airportData = await sql`
      SELECT id, code FROM airports
    `;
    const airportMap = {};
    airportData.forEach(airport => {
      airportMap[airport.code] = airport.id;
    });

    // Seed Sample Flights
    console.log("🛫 Seeding flights...");

    const flights = [
      {
        flight_number: 'AA1001',
        flight_date: new Date('2024-12-15T08:30:00'),
        duration_minutes: 180,
        distance_km: 1200.5,
        source_airport_code: 'IST',
        destination_airport_code: 'FRA',
        vehicle_type_id: vehicleTypeIds[0].id,
        is_shared: false
      },
      {
        flight_number: 'AA1002',
        flight_date: new Date('2024-12-15T14:45:00'),
        duration_minutes: 420,
        distance_km: 3200.0,
        source_airport_code: 'IST',
        destination_airport_code: 'JFK',
        vehicle_type_id: vehicleTypeIds[2].id,
        is_shared: false
      },
      {
        flight_number: 'AA1003',
        flight_date: new Date('2024-12-16T10:00:00'),
        duration_minutes: 210,
        distance_km: 2500.7,
        source_airport_code: 'IST',
        destination_airport_code: 'LHR',
        vehicle_type_id: vehicleTypeIds[0].id,
        is_shared: false
      },
      {
        flight_number: 'AA1004',
        flight_date: new Date('2024-12-16T16:20:00'),
        duration_minutes: 165,
        distance_km: 980.3,
        source_airport_code: 'FRA',
        destination_airport_code: 'CDG',
        vehicle_type_id: vehicleTypeIds[1].id,
        is_shared: true,
        shared_flight_number: 'BA2345',
        shared_airline_name: 'British Airways',
        connecting_flight_info: {
          connecting_flight_number: 'BA2346',
          connecting_airline: 'British Airways',
          connection_airport: 'LHR',
          layover_minutes: 90
        }
      },
      {
        flight_number: 'AA1005',
        flight_date: new Date('2024-12-17T09:15:00'),
        duration_minutes: 285,
        distance_km: 2100.8,
        source_airport_code: 'IST',
        destination_airport_code: 'DXB',
        vehicle_type_id: vehicleTypeIds[2].id,
        is_shared: false
      },
      {
        flight_number: 'AA1006',
        flight_date: new Date('2024-12-17T18:30:00'),
        duration_minutes: 195,
        distance_km: 1350.2,
        source_airport_code: 'AMS',
        destination_airport_code: 'IST',
        vehicle_type_id: vehicleTypeIds[1].id,
        is_shared: true,
        shared_flight_number: 'KL4567',
        shared_airline_name: 'KLM Royal Dutch Airlines',
        connecting_flight_info: {
          connecting_flight_number: 'KL4568',
          connecting_airline: 'KLM Royal Dutch Airlines',
          connection_airport: 'AMS',
          layover_minutes: 120
        }
      }
    ];

    for (const flight of flights) {

      await sql`
        INSERT INTO flights (
          flight_number,
          flight_date,
          duration_minutes,
          distance_km,
          source_airport_id,
          destination_airport_id,
          vehicle_type_id,
          is_shared,
          shared_flight_number,
          shared_airline_name,
          connecting_flight_info
        )
        VALUES (
          UPPER(${flight.flight_number}),
          ${flight.flight_date}::TIMESTAMP,
          ${flight.duration_minutes},
          ${flight.distance_km},
          ${airportMap[flight.source_airport_code]},
          ${airportMap[flight.destination_airport_code]},
          ${flight.vehicle_type_id},
          ${flight.is_shared || false},
          ${flight.shared_flight_number ? flight.shared_flight_number.toUpperCase() : null},
          ${flight.shared_airline_name || null},
          ${flight.connecting_flight_info ? JSON.stringify(flight.connecting_flight_info) : null}::JSONB
        )
        ON CONFLICT (flight_number) DO NOTHING
      `;
    }

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedData();

