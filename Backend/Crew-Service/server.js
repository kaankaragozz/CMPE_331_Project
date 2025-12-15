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
//CabinCrew
import attendantTypesRoutes from "./routes/attendant_typesRoutes.js";
import cabinCrewRoutes from "./routes/cabin_crewRoutes.js";
import cabinCrewVehicleRestrictionsRoutes from "./routes/cabin_crew_vehicle_restrictionsRoutes.js";
import dishRecipesRoutes from "./routes/dish_recipesRoutes.js";
//Pilot
import pilotsRoutes from "./routes/pilotsRoutes.js";
import pilotsLanguagesRoutes from "./routes/pilots_languagesRoutes.js";

// =====================
// DB Init
// =====================
//CabinCrew
import { initDB_attendant_types } from "./db/initDB_attendant_types.js";
import { initDB_cabin_crew } from "./db/initDB_cabin_crew.js";
import { initDB_cabin_crew_vehicle_restrictions } from "./db/initDB_cabin_crew_vehicle_restrictions.js";
import { initDB_dish_recipes } from "./db/initDB_dish_recipes.js";
//Pilot
import { createPilotsTable } from "./db/initDB_pilots.js";
import { createPilotLanguagesTable, createLanguagesTable } from "./db/initDB_pilots_languages.js";

// =====================
// Seeds
// =====================
//CabinCrew
import { seedAttendantTypes } from "./seeds/attendant_types.js";
import { seedCabinCrew } from "./seeds/cabin_crew.js";
import { seedCabinCrewVehicleRestrictions } from "./seeds/cabin_crew_vehicle_restrictions.js";
import { seedDishRecipes } from "./seeds/dish_recipes.js";
//Pilot
import { seedPilots } from "./seeds/pilots.js";
import { seedLanguages } from "./seeds/pilots_languages.js";

// =====================
// Environment
// =====================
dotenv.config();

const app = express();
const PORT = process.env.CREW_SERVICE_PORT || 3002;

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
    service: "Crew Service",
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// Routes
// =====================
app.use("/api/attendant-types", attendantTypesRoutes);
app.use("/api/cabin-crew", cabinCrewRoutes);
app.use("/api/cabin-crew-vehicle-restrictions", cabinCrewVehicleRestrictionsRoutes);
app.use("/api/dish-recipes", dishRecipesRoutes);
app.use("/api/pilots", pilotsRoutes);
app.use("/api/pilots-languages", pilotsLanguagesRoutes);

// =====================
// Server Start (Auth-style)
// =====================
initDB_attendant_types()
  .then(() => initDB_cabin_crew())
  .then(() => initDB_cabin_crew_vehicle_restrictions())
  .then(() => initDB_dish_recipes())

  //Pilot
  .then(() => createPilotsTable())       // ✅ parent
  .then(() => createLanguagesTable())
  .then(() => createPilotLanguagesTable())  // junction (needs both)
  .then(async () => {
    if (process.env.NODE_ENV !== "production") {
      //CabinCrew
      await seedAttendantTypes();
      await seedCabinCrew();
      await seedCabinCrewVehicleRestrictions();
      await seedDishRecipes();
      //Pilot
      await seedPilots();
      await seedLanguages();
      //await seedPilotsLanguages();
    }

    app.listen(PORT, () => {
      console.log(`🧑‍✈️ Crew Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start Crew Service:", err);
    process.exit(1);
  });
