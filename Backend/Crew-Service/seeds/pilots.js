import { sql } from '../config/db.js';

export const seedPilots = async () => {
  try {
    console.log('Seeding pilots...');

    // Clear pilots table to ensure idempotent seeding
    await sql`TRUNCATE TABLE pilots RESTART IDENTITY CASCADE`;

    const pilots = [
      // Senior Pilots (3)
      { name: 'John Smith', age: 45, gender: 'Male', nationality: 'American', vehicle_restriction: 'Boeing 737', allowed_range: 5000, seniority_level: 'Senior' },
      { name: 'Sarah Johnson', age: 42, gender: 'Female', nationality: 'British', vehicle_restriction: 'Airbus A320', allowed_range: 6000, seniority_level: 'Senior' },
      { name: 'Michael Chen', age: 48, gender: 'Male', nationality: 'Chinese', vehicle_restriction: 'Boeing 737', allowed_range: 5500, seniority_level: 'Senior' },
      // Junior Pilots (4)
      { name: 'Emily Davis', age: 32, gender: 'Female', nationality: 'Canadian', vehicle_restriction: 'Airbus A320', allowed_range: 4000, seniority_level: 'Junior' },
      { name: 'David Wilson', age: 29, gender: 'Male', nationality: 'Australian', vehicle_restriction: 'Boeing 737', allowed_range: 3500, seniority_level: 'Junior' },
      { name: 'Lisa Anderson', age: 31, gender: 'Female', nationality: 'Swedish', vehicle_restriction: 'Airbus A320', allowed_range: 4200, seniority_level: 'Junior' },
      { name: 'Robert Brown', age: 28, gender: 'Male', nationality: 'German', vehicle_restriction: 'Boeing 737', allowed_range: 3800, seniority_level: 'Junior' },
      // Trainee Pilots (3)
      { name: 'James Taylor', age: 24, gender: 'Male', nationality: 'American', vehicle_restriction: 'Boeing 737', allowed_range: 2000, seniority_level: 'Trainee' },
      { name: 'Maria Garcia', age: 25, gender: 'Female', nationality: 'Spanish', vehicle_restriction: 'Airbus A320', allowed_range: 2200, seniority_level: 'Trainee' },
      { name: 'Thomas Lee', age: 23, gender: 'Male', nationality: 'Korean', vehicle_restriction: 'Boeing 737', allowed_range: 1800, seniority_level: 'Trainee' }
    ];

    // Insert pilots
    for (const pilot of pilots) {
      await sql`
        INSERT INTO pilots (name, age, gender, nationality, vehicle_restriction, allowed_range, seniority_level)
        VALUES (${pilot.name}, ${pilot.age}, ${pilot.gender}, ${pilot.nationality}, ${pilot.vehicle_restriction}, ${pilot.allowed_range}, ${pilot.seniority_level})
      `;
    }

    console.log(`✓ Inserted ${pilots.length} pilots`);

    // Assign languages to pilots
    console.log('Assigning languages to pilots...');
    const allPilots = await sql`SELECT id FROM pilots ORDER BY id ASC`;
    const allLanguages = await sql`SELECT id FROM languages ORDER BY id ASC`;

    if (allPilots.length > 0 && allLanguages.length > 0) {
      let assignmentIndex = 0;
      for (const pilot of allPilots) {
        const langIndex1 = assignmentIndex % allLanguages.length;
        const langIndex2 = (assignmentIndex + 1) % allLanguages.length;

        if (langIndex1 !== langIndex2) {
          await sql`
            INSERT INTO pilot_languages (pilot_id, language_id)
            VALUES (${pilot.id}, ${allLanguages[langIndex1].id}), (${pilot.id}, ${allLanguages[langIndex2].id})
            ON CONFLICT DO NOTHING
          `;
        } else if (allLanguages.length > 1) {
          await sql`
            INSERT INTO pilot_languages (pilot_id, language_id)
            VALUES (${pilot.id}, ${allLanguages[langIndex1].id}), (${pilot.id}, ${allLanguages[(langIndex1 + 1) % allLanguages.length].id})
            ON CONFLICT DO NOTHING
          `;
        }

        assignmentIndex += 2;
      }
      console.log(`✓ Assigned languages to ${allPilots.length} pilots`);
    }


  } catch (error) {
    console.error('Error seeding pilots:', error);
    throw error;
  }
};


