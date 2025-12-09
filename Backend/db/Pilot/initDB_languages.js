import { Language } from '../../models/index.js';

export const initLanguages = async () => {
  console.log('Initializing languages table...');
  await Language.sync({ alter: true });
  console.log('Languages table initialized.');
};
