//Library Imports
import dotenv from 'dotenv';
dotenv.config(); //To use .env file - MUST be before other imports that use env variables

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import { initDB } from './db/initDB.js';
import flightinfoRoutes from './routes/flightinfoRoutes.js';
import cabinCrewRoutes from './routes/cabinCrewRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware 
app.use(express.json()); //Parse incoming JSON requests and puts the parsed data in req.body 
app.use(cors()); //Enable CORS (Cross-Origin Resource Sharing) for handling requests from different origins 
app.use(helmet()); //Middleware for security that helps you protect your app by setting various HTTP headers 
app.use(morgan('dev')); //HTTP request logger middleware for node.js 

//Route call 
app.use("/api/flight", flightinfoRoutes);
app.use("/api/cabin-crew", cabinCrewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Flight API is running',
    timestamp: new Date().toISOString()
  });
});

//Initialize Database and Start Server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("✅ Server is running on port: " + PORT);
      console.log("✅ Flight API endpoints available at: http://localhost:" + PORT + "/api/flight");
    });
  })
  .catch((error) => {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  });

