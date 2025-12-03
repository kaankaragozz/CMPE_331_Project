const sequelize = require('../config/database');
const Pilot = require('../models/Pilot');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Syncing models (force: true)...');
    await sequelize.sync({ force: true });
    console.log('Models synced successfully.');

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

    await Pilot.bulkCreate(pilots);
    console.log(`Successfully created ${pilots.length} pilots.`);
    
    console.log('Database Seeded Successfully');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await sequelize.close();
    process.exit(1);
  }
};

seedDatabase();




