import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const { PGUSER, PGPASSWORD, PGHOST, PGDATABASE } = process.env;

// Validate that all required environment variables are present
if (!PGUSER || !PGPASSWORD || !PGHOST || !PGDATABASE) {
  console.error('❌ Missing required environment variables:');
  if (!PGUSER) console.error('  - PGUSER');
  if (!PGPASSWORD) console.error('  - PGPASSWORD');
  if (!PGHOST) console.error('  - PGHOST');
  if (!PGDATABASE) console.error('  - PGDATABASE');
  console.error('\nPlease ensure these are set in your .env file');
  process.exit(1);
}

//create SQL connection using our env variables
export const sql = neon(
  `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
)

//this sql function we export is used as a tagged template literal, which allows us to write SQL queries in a more readable way

