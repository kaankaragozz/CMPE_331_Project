const { sequelize } = require('../models');
const seedLanguages = require('./Pilot/languages');
const seedPilots = require('./Pilot/pilots');

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Syncing models (force: true)...');
    await sequelize.sync({ force: true });
    console.log('Models synced successfully.');

    const languageByName = await seedLanguages();
    await seedPilots(languageByName);

    console.log('All seeds completed successfully.');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await sequelize.close();
    process.exit(1);
  }
};

seedDatabase();
