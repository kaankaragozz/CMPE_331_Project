const { sequelize } = require('../models');
const seedLanguages = require('./seedLanguages');
const seedPilots = require('./seedPilots');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Syncing models (force: true)...');
    await sequelize.sync({ force: true });
    console.log('Models synced successfully.');

    // Seed languages first
    const languageByName = await seedLanguages();

    // Then seed pilots (which depends on languages)
    await seedPilots(languageByName);

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
