//Library Imports
import dotenv from 'dotenv';
dotenv.config(); //To use .env file - MUST be before other imports that use env variables

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import { initDB } from './db/initDB.js';
import flightinfoRoutes from './routes/flightinfoRoutes.js';

//Yusuf: CabinCrew
import cabin_crewRoutes from './routes/cabin_crewRoutes.js';
import attendant_typesRoutes from './routes/attendant_typesRoutes.js';
import dish_recipesRoutes from './routes/dish_recipesRoutes.js';
import cabin_crew_vehicle_restrictionsRoutes from './routes/cabin_crew_vehicle_restrictionsRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware 
app.use(express.json()); //Parse incoming JSON requests and puts the parsed data in req.body 
app.use(cors()); //Enable CORS (Cross-Origin Resource Sharing) for handling requests from different origins 
app.use(helmet()); //Middleware for security that helps you protect your app by setting various HTTP headers 
app.use(morgan('dev')); //HTTP request logger middleware for node.js 

//Route call 
app.use("/api/flight", flightinfoRoutes);

//Yusuf: CabinCrew
app.use("/api/cabin_crew", cabin_crewRoutes);
app.use("/api/attendant_types", attendant_typesRoutes);
app.use("/api/dish_recipes", dish_recipesRoutes);
app.use("/api/cabin_crew_vehicle_restrictions", cabin_crew_vehicle_restrictionsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Flight & CabinCrew API is running',
    timestamp: new Date().toISOString()
  });
});

//Initialize Database and Start Server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("✅ Server is running on port: " + PORT);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  });

