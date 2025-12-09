import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//Route Import
import denemeRoutes from './routes/denemeRoutes.js';
//Hakan:Auth
import authRoutes from "./routes/Auth/authRoutes.js";
import userRoutes from "./routes/Auth/userRoutes.js";
//Kaan:Flight
import flightRoutes from "./routes/Flight/flightsRoutes.js";
import vehicle_typesRoutes from './routes/Flight/vehicle_typesRoutes.js';
import airportsRoutes from "./routes/Flight/airportsRoutes.js";

//Yusuf:CabinCrew
import cabin_crewRoutes from "./routes/CabinCrew/cabin_crewRoutes.js";
import attendant_typesRoutes from "./routes/CabinCrew/attendant_typesRoutes.js";
import dish_recipesRoutes from "./routes/CabinCrew/dish_recipesRoutes.js";
import cabin_crew_vehicle_restrictionsRoutes from "./routes/CabinCrew/cabin_crew_vehicle_restrictionsRoutes.js";

//Tunahan:Pilot
import pilotRoutes from "./routes/Pilot/pilotRoutes.js";

//Arif:Passengers
import passengersRoutes from "./routes/passengersRoutes.js";

import { initDB } from "./db/initDB.js";


dotenv.config(); //To use .env file 

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Route call 

//Hakan: Auth
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/deneme", denemeRoutes);
//Kaan:Flight
app.use("/api/flight", flightRoutes);
app.use("/api/vehicle_types", vehicle_typesRoutes);
app.use("/api/airports", airportsRoutes);

//Yusuf:CabinCrew
app.use("/api/cabin_crew", cabin_crewRoutes);
app.use("/api/attendant_types", attendant_typesRoutes);
app.use("/api/dish_recipes", dish_recipesRoutes);
app.use("/api/cabin_crew_vehicle_restrictions", cabin_crew_vehicle_restrictionsRoutes);

//Tunahan:Pilot
app.use("/api/pilots", pilotRoutes);

//Arif:Passenger
app.use("/api/passengers", passengersRoutes);



//Listen to Backend Server 
initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
  });
})
