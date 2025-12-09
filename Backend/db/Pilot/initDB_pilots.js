const { Pilot } = require('../../models');

const initPilots = async () => {
  console.log('Initializing pilots table...');
  await Pilot.sync({ alter: true });
  console.log('Pilots table initialized.');
};

module.exports = initPilots;
