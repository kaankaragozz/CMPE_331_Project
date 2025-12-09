import { Language } from '../../models/index.js';
import { sequelize } from '../../config/db.js';

const seedLanguages = async () => {
  try {
    await sequelize.authenticate();
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

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding languages:', error);
    await sequelize.close();
    process.exit(1);
  }
};

seedLanguages();
