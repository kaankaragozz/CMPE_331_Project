//Library Imports
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

import { sql } from "./config/db.js";
//Route Import
import denemeRoutes from './routes/denemeRoutes.js';




dotenv.config(); //To use .env file 

const app = express();
const PORT = process.env.PORT;

//Middleware 
app.use(express.json()); //Parse incoming JSON requests and puts the parsed data in req.body 
app.use(cors()); //Enable CORS (Cross-Origin Resource Sharing) for handling requests from different origins 
app.use(helmet()); //Middleware for security that helps you protect your app by setting various HTTP headers 
app.use(morgan('dev')); //HTTP request logger middleware for node.js 


//Route call 
app.use("/api/deneme", denemeRoutes);

//Initialize Database 
async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS deneme (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Database initialized successfully");
  }
  catch (error) {
    console.log("Error initializing database", error);
  }
}

//Listen to Backend Server 
initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
  });
})