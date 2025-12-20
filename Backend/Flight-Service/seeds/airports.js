import { sql } from '../config/db.js';

export async function seedAirports() {
  console.log("✈️ Seeding airports...");

  const airports = [
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
    { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
    { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' }
  ];

  for (const airport of airports) {
    await sql`
      INSERT INTO airports (code, name, city, country)
      VALUES (${airport.code}, ${airport.name}, ${airport.city}, ${airport.country})
      ON CONFLICT (code) DO NOTHING
    `;
  }
}

