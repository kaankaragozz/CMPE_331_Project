import { sql } from '../../config/db.js';

const seedLanguages = async () => {
  try {
    console.log('Seeding languages...');

    // Clear languages and junction table to ensure idempotent seeding
    await sql('TRUNCATE TABLE languages, pilot_languages RESTART IDENTITY CASCADE');
    
    const languages = [
      { name: 'Turkish', code: 'TR' },
      { name: 'English', code: 'EN' },
      { name: 'German', code: 'DE' },
      { name: 'French', code: 'FR' },
      { name: 'Spanish', code: 'ES' }
    ];

    for (const lang of languages) {
      await sql(
        'INSERT INTO languages (name, code) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
        [lang.name, lang.code]
      );
    }

    console.log(`✓ Inserted ${languages.length} languages`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding languages:', error);
    process.exit(1);
  }
};

seedLanguages();
