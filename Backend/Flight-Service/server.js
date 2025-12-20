// =====================
// Library Imports
// =====================
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

// =====================
// Routes
// =====================
import airportsRoutes from "./routes/airportsRoutes.js";
import flightsRoutes from "./routes/flightsRoutes.js";
import vehicleTypesRoutes from "./routes/vehicle_typesRoutes.js";
import crewAssignmentsRoutes from "./routes/crew_assignmentsRoutes.js"; // ✅

import flight_recipeRoutes from "./routes/flight_recipeRoutes.js";

// =====================
// DB Init
// =====================
import { initAirportsTable } from "./db/initDB_airports.js";
import { initFlightsTable } from "./db/initDB_flights.js";
import { initVehicleTypesTable } from "./db/initDB_vehicle_types.js";
import { initDB_pilot_flight_assignments } from "./db/initDB_pilot_flight_assignments.js"; // ✅
import { initCompaniesTable } from "./db/initDB_companies.js";

import { initDB_Flight_Recipe } from "./db/initDB_flight_recipe.js"

// =====================
// Seeds
// =====================
import { seedAirports } from "./seeds/airports.js";
import { seedFlights } from "./seeds/flights.js";
import { seedVehicleTypes } from "./seeds/vehicle_types.js";
import { seedCompanies } from "./seeds/companies.js";



// =====================
// Environment
// =====================
dotenv.config();

const app = express();
const PORT = process.env.FLIGHT_SERVICE_PORT || 3003;

// =====================
// Middleware
// =====================
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// =====================
// Health Check
// =====================
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "Flight Service",
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// Routes
// =====================
app.use("/api/airports", airportsRoutes);
app.use("/api/flights", flightsRoutes);
app.use("/api/vehicle-types", vehicleTypesRoutes);
app.use("/api/flights", crewAssignmentsRoutes);
app.use("/api/flight_recipes", flight_recipeRoutes)

// =====================
// Export app for testing
// =====================
export default app;

// =====================
// Server Start
// =====================
if (process.env.NODE_ENV !== "test") {
  initAirportsTable()
    .then(() => initCompaniesTable())
    .then(() => initVehicleTypesTable())
    .then(() => initFlightsTable())
    .then(() => initDB_pilot_flight_assignments()) // ✅ ensure table
    .then(() => initDB_Flight_Recipe())
    .then(async () => {
      if (process.env.NODE_ENV !== "production") {
        await seedCompanies();
        await seedVehicleTypes();
        await seedAirports();
        await seedFlights();
      }

      app.listen(PORT, () => {
        console.log(`✈️ Flight Service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to start Flight Service:", err);
      process.exit(1);
    });
}
