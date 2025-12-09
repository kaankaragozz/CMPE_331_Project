import { Sequelize } from 'sequelize';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Sequelize connection for Pilot module (Tunahan)
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false // Set to console.log if you want to see SQL queries
});

// Neon connection for other modules (Team)
const { PGUSER, PGPASSWORD, PGHOST, PGDATABASE } = process.env;

//create SQL connection using our env variables
export const sql = neon(
  `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
)

//this sql function we export is used as a tagged template literal, which allows us to write SQL quarires in a more readable way  
