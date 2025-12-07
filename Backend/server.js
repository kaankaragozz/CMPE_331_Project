//Library Imports
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

//Route Import
import denemeRoutes from './routes/denemeRoutes.js';

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

//Listen to Backend Server 
initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
  });
})