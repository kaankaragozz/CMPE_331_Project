import { sql } from '../config/db.js';

export async function seedFlights() {
  console.log("🛫 Seeding flights...");

  // Delete flights that are not from AA or TK companies
  await sql`
    DELETE FROM flights 
    WHERE flight_number NOT LIKE 'AA%' 
      AND flight_number NOT LIKE 'TK%'
  `;

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

  // Get company IDs (extract from flight number prefix)
  const companiesData = await sql`
    SELECT id, code FROM companies
  `;
  const companyMap = {};
  companiesData.forEach(company => {
    companyMap[company.code] = company.id;
  });

  const flights = [
    // American Airlines (AA) flights
    {
      flight_number: 'AA1001',
      flight_date: new Date('2025-12-15T08:30:00'),
      duration_minutes: 180,
      distance_km: 1200.5,
      source_airport_code: 'IST',
      destination_airport_code: 'FRA',
      vehicle_type_id: vehicleTypeIds[0]?.id || 1,
      is_shared: false
    },
    {
      flight_number: 'AA1002',
      flight_date: new Date('2025-12-15T14:45:00'),
      duration_minutes: 420,
      distance_km: 3200.0,
      source_airport_code: 'IST',
      destination_airport_code: 'JFK',
      vehicle_type_id: vehicleTypeIds[2]?.id || 3,
      is_shared: false
    },
    // Turkish Airlines (TK) flights
    {
      flight_number: 'TK2001',
      flight_date: new Date('2025-12-15T10:00:00'),
      duration_minutes: 195,
      distance_km: 1350.2,
      source_airport_code: 'IST',
      destination_airport_code: 'AMS',
      vehicle_type_id: vehicleTypeIds[1]?.id || 2,
      is_shared: false
    },
    {
      flight_number: 'TK2002',
      flight_date: new Date('2025-12-16T11:30:00'),
      duration_minutes: 285,
      distance_km: 2100.8,
      source_airport_code: 'IST',
      destination_airport_code: 'DXB',
      vehicle_type_id: vehicleTypeIds[2]?.id || 3,
      is_shared: false
    },
    {
      flight_number: 'TK2003',
      flight_date: new Date('2025-12-17T09:15:00'),
      duration_minutes: 240,
      distance_km: 1800.5,
      source_airport_code: 'IST',
      destination_airport_code: 'LHR',
      vehicle_type_id: vehicleTypeIds[0]?.id || 1,
      is_shared: false
    }
  ];

  for (const flight of flights) {
    // Extract company code from flight number (first 2 characters)
    const companyCode = flight.flight_number.substring(0, 2);
    const companyId = companyMap[companyCode] || null;

    await sql`
      INSERT INTO flights (
        flight_number,
        flight_date,
        duration_minutes,
        distance_km,
        source_airport_id,
        destination_airport_id,
        vehicle_type_id,
        company_id,
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
        ${companyId},
        ${flight.is_shared || false},
        ${flight.shared_flight_number ? flight.shared_flight_number.toUpperCase() : null},
        ${flight.shared_airline_name || null},
        ${flight.connecting_flight_info ? JSON.stringify(flight.connecting_flight_info) : null}::JSONB
      )
      ON CONFLICT (flight_number) DO UPDATE SET
        company_id = EXCLUDED.company_id
    `;
  }
  
  console.log("  ✅ Flights seeded with company associations");
}


