import { sql } from '../config/db.js';

export async function seedCompanies() {
  console.log("🏢 Seeding companies...");

  // Delete companies that are not AA or TK
  await sql`
    DELETE FROM companies 
    WHERE code NOT IN ('AA', 'TK')
  `;

  const companies = [
    { code: 'AA', name: 'American Airlines', country: 'United States' },
    { code: 'TK', name: 'Turkish Airlines', country: 'Turkey' }
  ];

  for (const company of companies) {
    await sql`
      INSERT INTO companies (code, name, country)
      VALUES (${company.code}, ${company.name}, ${company.country})
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        country = EXCLUDED.country,
        updated_at = CURRENT_TIMESTAMP
    `;
  }

  console.log(`  ✅ ${companies.length} companies seeded`);
}

