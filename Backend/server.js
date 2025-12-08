//Library Imports
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

//Route Import
import denemeRoutes from './routes/denemeRoutes.js';
//Kaan:Flight
import flightRoutes from "./routes/flightsRoutes.js";
import vehicle_typesRoutes from './routes/vehicle_typesRoutes.js';
import airportsRoutes from "./routes/airportsRoutes.js";

//Yusuf:CabinCrew
import cabin_crewRoutes from "./routes/cabin_crewRoutes.js";
import attendant_typesRoutes from "./routes/attendant_typesRoutes.js";
import dish_recipesRoutes from "./routes/dish_recipesRoutes.js";
import cabin_crew_vehicle_restrictionsRoutes from "./routes/cabin_crew_vehicle_restrictionsRoutes.js";

//Tunahan:Pilot
import pilotsRoutes from "./routes/pilotsRoutes.js";
import pilots_languagesRoutes from "./routes/pilots_languagesRoutes.js";

//Arif:Passengers
import passengersRoutes from "./routes/passengersRoutes.js";
import flight_passengers_assignmentsRoutes from "./routes/flight_passengers_assignmentsRoutes.js";


import { initDB } from "./db/initDB.js"


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
app.use("/api/pilots", pilotsRoutes);
app.use("/api/pilots_languages", pilots_languagesRoutes);


//Arif:Passenger
app.use("/api/passengers", passengersRoutes);
app.use("/api/flight_passengers_assignments", flight_passengers_assignmentsRoutes);



//Listen to Backend Server 
initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
  });
})