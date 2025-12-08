import { sql } from "../config/db.js";

export async function flights() {
  try {

    console.log("✅ DataBase flights initialized successfully")
  } catch (error) {
    console.log("❌ Error initDB_flights", error);
  }
};