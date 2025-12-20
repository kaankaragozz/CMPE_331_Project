import { sql } from "../config/db.js";

export const SAMPLE_CABIN_CREW = [
  //Hakan
  // Chiefs
  { first_name: 'Noah', last_name: 'Wilson', age: 38, gender: 'Male', nationality: 'Australian', known_languages: ['English'], attendant_type_name: 'chief' },
  { first_name: 'Emma', last_name: 'Smith', age: 42, gender: 'Female', nationality: 'British', known_languages: ['English', 'French'], attendant_type_name: 'chief' },

  // Senior flight attendants
  { first_name: 'Liam', last_name: 'Johnson', age: 35, gender: 'Male', nationality: 'Canadian', known_languages: ['English', 'Spanish'], attendant_type_name: 'senior_flight_attendant' },
  { first_name: 'Olivia', last_name: 'Brown', age: 33, gender: 'Female', nationality: 'American', known_languages: ['English'], attendant_type_name: 'senior_flight_attendant' },

  // Junior flight attendants (4-16)
  { first_name: 'Mia', last_name: 'Anderson', age: 27, gender: 'Female', nationality: 'American', known_languages: ['English'], attendant_type_name: 'junior_flight_attendant' },
  { first_name: 'Ethan', last_name: 'Davis', age: 25, gender: 'Male', nationality: 'Australian', known_languages: ['English'], attendant_type_name: 'junior_flight_attendant' },
  { first_name: 'Sophia', last_name: 'Martinez', age: 29, gender: 'Female', nationality: 'Spanish', known_languages: ['Spanish', 'English'], attendant_type_name: 'junior_flight_attendant' },
  { first_name: 'James', last_name: 'Miller', age: 28, gender: 'Male', nationality: 'Canadian', known_languages: ['English', 'French'], attendant_type_name: 'junior_flight_attendant' },
  { first_name: 'Ava', last_name: 'Wilson', age: 26, gender: 'Female', nationality: 'British', known_languages: ['English'], attendant_type_name: 'junior_flight_attendant' },
  { first_name: 'Lucas', last_name: 'Taylor', age: 24, gender: 'Male', nationality: 'American', known_languages: ['English'], attendant_type_name: 'junior_flight_attendant' },
  { first_name: 'Charlotte', last_name: 'Harris', age: 27, gender: 'Female', nationality: 'Canadian', known_languages: ['English', 'French'], attendant_type_name: 'junior_flight_attendant' },
  { first_name: 'Benjamin', last_name: 'Clark', age: 29, gender: 'Male', nationality: 'Australian', known_languages: ['English'], attendant_type_name: 'junior_flight_attendant' },

  // Chefs
  { first_name: 'Isabella', last_name: 'Garcia', age: 34, gender: 'Female', nationality: 'Mexican', known_languages: ['Spanish', 'English'], attendant_type_name: 'chef', recipes: ['Tacos', 'Enchiladas', 'Guacamole'] },
  { first_name: 'Alexander', last_name: 'Lee', age: 39, gender: 'Male', nationality: 'Korean', known_languages: ['Korean', 'English'], attendant_type_name: 'chef', recipes: ['Bibimbap', 'Kimchi', 'Bulgogi', 'Japchae'] }
];

export async function seedCabinCrew() {
  try {
    console.log("👥 Seeding cabin crew...");

    // First, clear existing data
    await sql`TRUNCATE TABLE cabin_crew RESTART IDENTITY CASCADE`;

    // Get attendant types from database to map names to IDs
    const attendantTypes = await sql`
      SELECT id, type_name FROM attendant_types ORDER BY id
    `;
    const typeMap = {};
    attendantTypes.forEach(type => {
      typeMap[type.type_name] = type.id;
    });

    // Insert all cabin crew using type names to get correct IDs
    for (const crew of SAMPLE_CABIN_CREW) {
      const attendantTypeId = typeMap[crew.attendant_type_name];

      if (!attendantTypeId) {
        console.error(`❌ Attendant type "${crew.attendant_type_name}" not found for crew member ${crew.first_name} ${crew.last_name}`);
        continue;
      }

      // Convert JavaScript array to PostgreSQL array literal format: '{"value1","value2"}'
      // Each string needs to be quoted and escaped if necessary
      const languagesArray = crew.known_languages.map(lang => `"${lang}"`).join(',');
      const languagesString = `{${languagesArray}}`;

      await sql`
        INSERT INTO cabin_crew (first_name, last_name, age, gender, nationality, known_languages, attendant_type_id)
        VALUES (${crew.first_name}, ${crew.last_name}, ${crew.age}, ${crew.gender}, ${crew.nationality}, ${languagesString}::text[], ${attendantTypeId})
      `;
    }

    console.log("✅ Cabin crew seeded successfully");

  } catch (error) {
    console.error("❌ Error seeding cabin crew:", error);
    throw error;
  }
}

