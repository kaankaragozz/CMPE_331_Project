const { Pilot, Language } = require('../models');

const seedPilots = async (languageByName) => {
  try {
    console.log('Clearing pilots table...');
    await Pilot.destroy({ where: {}, truncate: true, cascade: true });
    console.log('Pilots table cleared.');

    console.log('Seeding pilots...');
    const pilots = [
      // Senior Pilots (3)
      {
        name: 'John Smith',
        age: 45,
        gender: 'Male',
        nationality: 'American',
        vehicle_restriction: 'Boeing 737',
        allowed_range: 5000,
        seniority_level: 'Senior'
      },
      {
        name: 'Sarah Johnson',
        age: 42,
        gender: 'Female',
        nationality: 'British',
        vehicle_restriction: 'Airbus A320',
        allowed_range: 6000,
        seniority_level: 'Senior'
      },
      {
        name: 'Michael Chen',
        age: 48,
        gender: 'Male',
        nationality: 'Chinese',
        vehicle_restriction: 'Boeing 737',
        allowed_range: 5500,
        seniority_level: 'Senior'
      },
      // Junior Pilots (4)
      {
        name: 'Emily Davis',
        age: 32,
        gender: 'Female',
        nationality: 'Canadian',
        vehicle_restriction: 'Airbus A320',
        allowed_range: 4000,
        seniority_level: 'Junior'
      },
      {
        name: 'David Wilson',
        age: 29,
        gender: 'Male',
        nationality: 'Australian',
        vehicle_restriction: 'Boeing 737',
        allowed_range: 3500,
        seniority_level: 'Junior'
      },
      {
        name: 'Lisa Anderson',
        age: 31,
        gender: 'Female',
        nationality: 'Swedish',
        vehicle_restriction: 'Airbus A320',
        allowed_range: 4200,
        seniority_level: 'Junior'
      },
      {
        name: 'Robert Brown',
        age: 28,
        gender: 'Male',
        nationality: 'German',
        vehicle_restriction: 'Boeing 737',
        allowed_range: 3800,
        seniority_level: 'Junior'
      },
      // Trainee Pilots (3)
      {
        name: 'James Taylor',
        age: 24,
        gender: 'Male',
        nationality: 'American',
        vehicle_restriction: 'Boeing 737',
        allowed_range: 2000,
        seniority_level: 'Trainee'
      },
      {
        name: 'Maria Garcia',
        age: 25,
        gender: 'Female',
        nationality: 'Spanish',
        vehicle_restriction: 'Airbus A320',
        allowed_range: 2200,
        seniority_level: 'Trainee'
      },
      {
        name: 'Thomas Lee',
        age: 23,
        gender: 'Male',
        nationality: 'Korean',
        vehicle_restriction: 'Boeing 737',
        allowed_range: 1800,
        seniority_level: 'Trainee'
      }
    ];

    const createdPilots = await Pilot.bulkCreate(pilots, { returning: true });
    console.log(`Successfully created ${createdPilots.length} pilots.`);

    console.log('Associating pilots with languages...');

    // Helper functions for random language assignment
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const getRandomLanguagesForSeniority = (seniorityLevel) => {
      const allLanguages = Object.values(languageByName);
      let count;
      if (seniorityLevel === 'Senior') {
        count = randomInt(2, 3); // Seniors speak 2-3 languages
      } else if (seniorityLevel === 'Junior') {
        count = randomInt(1, 3); // Juniors speak 1-3 languages
      } else {
        count = 1; // Trainees speak exactly 1 language
      }
      return shuffled(allLanguages).slice(0, count);
    };

    // Assign languages to each pilot based on seniority level
    for (const pilot of createdPilots) {
      const langsForPilot = getRandomLanguagesForSeniority(pilot.seniority_level);
      await pilot.addLanguages(langsForPilot);
    }

    console.log('Pilots seeded successfully with language associations.');
  } catch (error) {
    console.error('Error seeding pilots:', error);
    throw error;
  }
};

module.exports = seedPilots;
