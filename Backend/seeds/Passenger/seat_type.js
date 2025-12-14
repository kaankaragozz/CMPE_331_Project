import { sql } from '../../config/db.js';

// Initialize database schema
export async function seedSeatType() {
  try {

    // Seed seat_type table with 'Business' and 'Economy'
    const seatTypes = await sql`SELECT COUNT(*) FROM seat_type`;
    if (parseInt(seatTypes[0].count) === 0) {
      await sql`
        INSERT INTO seat_type (type_name) VALUES ('Business'), ('Economy')
      `;
      console.log("ℹ️ Seeded seat_type table with 'Business' and 'Economy'.");
    }

    console.log("✅ Database seeat_type seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding seat_type database:", error);
  }
}

seedSeatType();

