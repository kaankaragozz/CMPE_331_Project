import pg from 'pg';

// Yusuf: CabinCrew
import { initDB_attendant_types } from './initDB_attendant_types.js';
import { initDB_cabin_crew } from './initDB_cabin_crew.js';
import { initDB_dish_recipes } from './initDB_dish_recipes.js';
import { initDB_cabin_crew_vehicle_restrictions } from './initDB_cabin_crew_vehicle_restrictions.js';

const pool = new pg.Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
  ssl: { rejectUnauthorized: false }, // SSL required for NeonDB
});

export async function initDB() {
  try {
    console.log(' Testing database connection...');
    const client = await pool.connect();
    console.log(' Successfully connected to database!');
    client.release();

    // Initialize all tables in correct order (respecting foreign key dependencies)
    // Yusuf: CabinCrew
    await initDB_attendant_types();
    await initDB_cabin_crew();
    await initDB_dish_recipes();
    await initDB_cabin_crew_vehicle_restrictions();

    console.log(' Database initialized successfully');
    return true;
  } catch (error) {
    console.error(' Error initializing database:', error);
    throw error;
  }
}

export { pool };
