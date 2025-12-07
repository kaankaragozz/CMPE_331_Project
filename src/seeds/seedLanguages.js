const { Language } = require('../models');

const seedLanguages = async () => {
  try {
    console.log('Clearing languages table...');
    await Language.destroy({ where: {}, truncate: true, cascade: true });
    console.log('Languages table cleared.');

    console.log('Seeding languages...');
    const languageData = [
      { name: 'English', iso_code: 'EN' },
      { name: 'Spanish', iso_code: 'ES' },
      { name: 'Turkish', iso_code: 'TR' },
      { name: 'German', iso_code: 'DE' },
      { name: 'French', iso_code: 'FR' }
    ];

    const createdLanguages = await Language.bulkCreate(languageData, { returning: true });
    console.log(`Successfully created ${createdLanguages.length} languages.`);

    // Return language map for use in seedPilots
    const languageByName = createdLanguages.reduce((acc, lang) => {
      acc[lang.name] = lang;
      return acc;
    }, {});

    return languageByName;
  } catch (error) {
    console.error('Error seeding languages:', error);
    throw error;
  }
};

module.exports = seedLanguages;
