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
      { name: 'Thomas Lee', age: 23, gender: 'Male', nationality: 'Korean', vehicle_type_name: 'Boeing 737-800', allowed_range: 1800, seniority_level: 'Trainee' },
      // Additional Pilots (5)
      { name: 'Anna Kowalski', age: 44, gender: 'Female', nationality: 'Polish', vehicle_type_name: 'Boeing 787 Dreamliner', allowed_range: 6800, seniority_level: 'Senior' },
      { name: 'Carlos Rodriguez', age: 30, gender: 'Male', nationality: 'Mexican', vehicle_type_name: 'Airbus A320', allowed_range: 4100, seniority_level: 'Junior' },
      { name: 'Sophie Martin', age: 27, gender: 'Female', nationality: 'French', vehicle_type_name: 'Boeing 737-800', allowed_range: 3600, seniority_level: 'Junior' },
      { name: 'Ahmed Hassan', age: 26, gender: 'Male', nationality: 'Egyptian', vehicle_type_name: 'Airbus A320', allowed_range: 2400, seniority_level: 'Trainee' },
      { name: 'Yuki Tanaka', age: 22, gender: 'Female', nationality: 'Japanese', vehicle_type_name: 'Boeing 787 Dreamliner', allowed_range: 2100, seniority_level: 'Trainee' }
    ];

    // Insert pilots using vehicle_type_id (TRUNCATE already cleared the table, so no duplicates)
    let insertedCount = 0;
    for (const pilot of pilots) {
      const vehicleTypeId = vehicleTypeMap[pilot.vehicle_type_name];
      
      if (!vehicleTypeId) {
        console.error(`❌ Vehicle type "${pilot.vehicle_type_name}" not found for pilot ${pilot.name}`);
        continue;
      }

      // Insert pilot (no check needed since TRUNCATE cleared the table)
      await sql`
        INSERT INTO pilots (name, age, gender, nationality, vehicle_type_id, allowed_range, seniority_level)
        VALUES (${pilot.name}, ${pilot.age}, ${pilot.gender}, ${pilot.nationality}, ${vehicleTypeId}, ${pilot.allowed_range}, ${pilot.seniority_level})
      `;
      insertedCount++;
    }

    console.log(`✓ Inserted ${insertedCount} pilots`);

    // Assign languages to pilots
    console.log('Assigning languages to pilots...');
    const allPilots = await sql`SELECT id FROM pilots ORDER BY id ASC`;
    const allLanguages = await sql`SELECT id FROM languages ORDER BY id ASC`;

    if (allPilots.length === 0) {
      console.warn('⚠️ No pilots found to assign languages');
      return;
    }

    if (allLanguages.length === 0) {
      console.warn('⚠️ No languages found in database. Please seed languages first.');
      return;
    }

    // Clear existing pilot_languages associations
    await sql`TRUNCATE TABLE pilot_languages RESTART IDENTITY CASCADE`;

    let assignmentCount = 0;
    for (const pilot of allPilots) {
      // Each pilot gets 2 languages (cycling through available languages)
      const langIndex1 = assignmentCount % allLanguages.length;
      const langIndex2 = (assignmentCount + 1) % allLanguages.length;

      const languageId1 = allLanguages[langIndex1].id;
      const languageId2 = allLanguages[langIndex2].id;

      // Insert both languages for this pilot
      await sql`
        INSERT INTO pilot_languages (pilot_id, language_id)
        VALUES (${pilot.id}, ${languageId1}), (${pilot.id}, ${languageId2})
        ON CONFLICT (pilot_id, language_id) DO NOTHING
      `;

      assignmentCount += 2;
    }

    console.log(`✓ Assigned languages to ${allPilots.length} pilots`);

    // Add 5 additional language assignments to pilots (extra languages)
    console.log('Adding 5 additional language assignments...');
    const extraAssignments = [];
    
    // Add extra languages to first 5 pilots (ensuring different languages)
    for (let i = 0; i < Math.min(5, allPilots.length); i++) {
      const pilot = allPilots[i];
      // Get a different language than the ones already assigned
      const extraLangIndex = (assignmentCount + i + 2) % allLanguages.length;
      const extraLanguageId = allLanguages[extraLangIndex].id;
      
      extraAssignments.push({
        pilot_id: pilot.id,
        language_id: extraLanguageId
      });
    }

    // Insert the 5 additional language assignments
    for (const assignment of extraAssignments) {
      await sql`
        INSERT INTO pilot_languages (pilot_id, language_id)
        VALUES (${assignment.pilot_id}, ${assignment.language_id})
        ON CONFLICT (pilot_id, language_id) DO NOTHING
      `;
    }

    console.log(`✓ Added ${extraAssignments.length} additional language assignments`);


  } catch (error) {
    console.error('Error seeding pilots:', error);
    throw error;
  }
};


