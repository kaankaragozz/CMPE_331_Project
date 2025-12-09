const { Language } = require('../../models');

const initLanguages = async () => {
  console.log('Initializing languages table...');
  await Language.sync({ alter: true });
  console.log('Languages table initialized.');
};

module.exports = initLanguages;
