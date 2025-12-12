import { sql } from '../../config/db.js';

export async function seedPassengers() {
  console.log("👥 Seeding passengers...");

  const passengers = [
    // Family 1 (The Yilmaz Family)
    { name: 'Ahmet Yilmaz', age: 35, gender: 'Male', nationality: 'Turkey' },
    { name: 'Ayse Yilmaz', age: 32, gender: 'Female', nationality: 'Turkey' },
    { name: 'Can Yilmaz', age: 8, gender: 'Male', nationality: 'Turkey' },
    { name: 'Bebek Yilmaz', age: 1, gender: 'Female', nationality: 'Turkey' }, // Infant

    // Family 2 (The Smiths)
    { name: 'John Smith', age: 45, gender: 'Male', nationality: 'USA' },
    { name: 'Sarah Smith', age: 42, gender: 'Female', nationality: 'USA' },
    { name: 'Mike Smith', age: 12, gender: 'Male', nationality: 'USA' },

    // Business Travelers
    { name: 'Hans Mueller', age: 50, gender: 'Male', nationality: 'Germany' },
    { name: 'Elena Rossi', age: 29, gender: 'Female', nationality: 'Italy' },
    { name: 'Yuki Tanaka', age: 38, gender: 'Female', nationality: 'Japan' },
    { name: 'Pierre Dubois', age: 41, gender: 'Male', nationality: 'France' },
    { name: 'Linda Johnson', age: 55, gender: 'Female', nationality: 'UK' },

    // Students / Solo Travelers
    { name: 'Maria Garcia', age: 22, gender: 'Female', nationality: 'Spain' },
    { name: 'Lars Jensen', age: 24, gender: 'Male', nationality: 'Denmark' },
    { name: 'Sophie Martin', age: 21, gender: 'Female', nationality: 'France' },
    { name: 'Ali Vural', age: 23, gender: 'Male', nationality: 'Turkey' },
    { name: 'Zeynep Demir', age: 25, gender: 'Female', nationality: 'Turkey' },
    { name: 'Ibrahim Kaya', age: 28, gender: 'Male', nationality: 'Turkey' },
    
    // Extra Travelers
    { name: 'Bruce Wayne', age: 40, gender: 'Male', nationality: 'USA' },
    { name: 'Clark Kent', age: 35, gender: 'Male', nationality: 'USA' },
    { name: 'Diana Prince', age: 300, gender: 'Female', nationality: 'Greece' },
    { name: 'Peter Parker', age: 18, gender: 'Male', nationality: 'USA' }
  ];

  try {
    for (const p of passengers) {
      // Check if passenger exists to avoid duplicates on re-run
      const existing = await sql`SELECT passenger_id FROM passengers WHERE name = ${p.name}`;
      
      if (existing.length === 0) {
        await sql`
          INSERT INTO passengers (name, age, gender, nationality)
          VALUES (${p.name}, ${p.age}, ${p.gender}, ${p.nationality})
        `;
      }
    }
    console.log(`✅ ${passengers.length} passengers processed successfully.`);
  } catch (error) {
    console.error("❌ Error seeding passengers:", error);
    throw error; // Re-throw to stop execution if needed
  }
}
