const { sequelize } = require('../models');
const initLanguages = require('./Pilot/initDB_languages');
const initPilots = require('./Pilot/initDB_pilots');

const initDB = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Initializing database schema...');
    await initLanguages();
    await initPilots();
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = initDB;
