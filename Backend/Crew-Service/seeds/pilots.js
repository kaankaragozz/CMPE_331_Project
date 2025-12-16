import { sql } from '../config/db.js';

export const seedPilots = async () => {
  try {
    console.log('Seeding pilots...');

    // Clear pilots table to ensure idempotent seeding
    await sql`TRUNCATE TABLE pilots RESTART IDENTITY CASCADE`;

    // Get vehicle types from database to map names to IDs
    const vehicleTypes = await sql`
      SELECT id, type_name FROM vehicle_types ORDER BY id
    `;
    const vehicleTypeMap = {};
    vehicleTypes.forEach(vt => {
      vehicleTypeMap[vt.type_name] = vt.id;
      // Also map short names (Boeing 737 -> Boeing 737-800)
      if (vt.type_name.includes('Boeing 737')) {
        vehicleTypeMap['Boeing 737'] = vt.id;
      }
    });

    const pilots = [
      // Senior Pilots (3) - Different vehicle types
      { name: 'John Smith', age: 45, gender: 'Male', nationality: 'American', vehicle_type_name: 'Boeing 737-800', allowed_range: 5000, seniority_level: 'Senior' },
      { name: 'Sarah Johnson', age: 42, gender: 'Female', nationality: 'British', vehicle_type_name: 'Airbus A320', allowed_range: 6000, seniority_level: 'Senior' },
      { name: 'Michael Chen', age: 48, gender: 'Male', nationality: 'Chinese', vehicle_type_name: 'Boeing 787 Dreamliner', allowed_range: 7000, seniority_level: 'Senior' },
      // Junior Pilots (4) - Mix of vehicle types
      { name: 'Emily Davis', age: 32, gender: 'Female', nationality: 'Canadian', vehicle_type_name: 'Airbus A320', allowed_range: 4000, seniority_level: 'Junior' },
      { name: 'David Wilson', age: 29, gender: 'Male', nationality: 'Australian', vehicle_type_name: 'Boeing 737-800', allowed_range: 3500, seniority_level: 'Junior' },
      { name: 'Lisa Anderson', age: 31, gender: 'Female', nationality: 'Swedish', vehicle_type_name: 'Boeing 787 Dreamliner', allowed_range: 4500, seniority_level: 'Junior' },
      { name: 'Robert Brown', age: 28, gender: 'Male', nationality: 'German', vehicle_type_name: 'Boeing 737-800', allowed_range: 3800, seniority_level: 'Junior' },
      // Trainee Pilots (3) - Mix of vehicle types
      { name: 'James Taylor', age: 24, gender: 'Male', nationality: 'American', vehicle_type_name: 'Boeing 737-800', allowed_range: 2000, seniority_level: 'Trainee' },
      { name: 'Maria Garcia', age: 25, gender: 'Female', nationality: 'Spanish', vehicle_type_name: 'Airbus A320', allowed_range: 2200, seniority_level: 'Trainee' },
      { name: 'Thomas Lee', age: 23, gender: 'Male', nationality: 'Korean', vehicle_type_name: 'Boeing 737-800', allowed_range: 1800, seniority_level: 'Trainee' }
    ];

    // Insert pilots using vehicle_type_id
    for (const pilot of pilots) {
      const vehicleTypeId = vehicleTypeMap[pilot.vehicle_type_name];
      
      if (!vehicleTypeId) {
        console.error(`❌ Vehicle type "${pilot.vehicle_type_name}" not found for pilot ${pilot.name}`);
        continue;
      }

      await sql`
        INSERT INTO pilots (name, age, gender, nationality, vehicle_type_id, allowed_range, seniority_level)
        VALUES (${pilot.name}, ${pilot.age}, ${pilot.gender}, ${pilot.nationality}, ${vehicleTypeId}, ${pilot.allowed_range}, ${pilot.seniority_level})
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


