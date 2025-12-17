import { sql } from '../config/db.js';

const languages = [
  { name: 'Turkish', code: 'TR' },
  { name: 'English', code: 'EN' },
  { name: 'German', code: 'DE' },
  { name: 'French', code: 'FR' },
  { name: 'Spanish', code: 'ES' }
];

export async function seedLanguages() {
  try {
    console.log('Seeding languages...');

    // TRUNCATE Sorgusu: Tırnaklı Şablon ile düzeltildi
    await sql`TRUNCATE TABLE languages, pilot_languages RESTART IDENTITY CASCADE`;


    for (const lang of languages) {
      // INSERT Sorgusu: Tırnaklı Şablon ile düzeltildi
      await sql`
        INSERT INTO languages (name, code) 
        VALUES (${lang.name}, ${lang.code}) 
        ON CONFLICT (code) DO NOTHING
      `;
    }

    console.log(`✓ Inserted ${languages.length} languages`);

  } catch (error) {
    console.error('Error seeding languages:', error);
    throw error;
  }
};
