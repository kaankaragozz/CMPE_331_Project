import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";

const SAMPLE_USERS = [
  { name: "admin",     password: "admin123",     role: "Admin" },
  { name: "pilot1",    password: "pilot123",     role: "Pilot",    pilot_id: 4 }, // Emily Davis
  { name: "cabincrew1",password: "cabincrew123", role: "CabinCrew" },
  { name: "passenger1",password: "passenger123", role: "Passenger" },
];

export async function seedUsers() {
  try {
    console.log("Tables are ready. Seeding users...");

    await sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`;

    for (const user of SAMPLE_USERS) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await sql`
        INSERT INTO users (name, password, role, pilot_id)
        VALUES (${user.name}, ${hashedPassword}, ${user.role}, ${user.pilot_id ?? null})
      `;
      console.log("Seeded user:", user.name);
    }

    console.log("✅ Users table seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding users table:", error);
    throw error;
  }
}
