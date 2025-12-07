const { sequelize } = require('../models');

const initDB = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Syncing models...');
    await sequelize.sync({ alter: false });
    console.log('Models synced successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = initDB;
