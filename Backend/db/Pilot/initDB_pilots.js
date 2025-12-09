import { Pilot } from '../../models/index.js';

export const initPilots = async () => {
  console.log('Initializing pilots table...');
  await Pilot.sync({ alter: true });
  console.log('Pilots table initialized.');
};
