import { sql } from '../../config/db.js';

export async function seedVehicleTypes() {
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
}
