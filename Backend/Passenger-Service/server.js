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
import passengersRoutes from "./routes/passengersRoutes.js";

// =====================
// DB Init
// =====================
import { initDB_passengers } from "./db/initDB_passengers.js";
import { initDB_flight_passengers_assignments } from "./db/initDB_flight_passengers_assignments.js";
import { initDB_infant_parent_relationship } from "./db/initDB_infant_parent_relationship.js";
import { initDB_affiliated_seating } from "./db/initDB_affiliated_seating.js";
import { initDB_seat_type } from "./db/initDB_seat_type.js";

// =====================
// Seeds
// =====================
import { seedPassengers } from "./seeds/passengers.js";
import { seedAffiliations } from "./seeds/affiliated_seating.js";
import { seedAssignments } from "./seeds/flight_passengers_assignments.js";
import { seedInfants } from "./seeds/infant_parent_relationship.js";
import { seedSeatType } from "./seeds/seat_type.js";

// =====================
// Environment
// =====================
dotenv.config();

const app = express();
const PORT = process.env.PASSENGER_SERVICE_PORT || 3004;

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
    service: "Passenger Service",
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// Routes
// =====================
app.use("/api/passengers", passengersRoutes);

// =====================
// Server Start
// =====================

// Check if we are in a test environment.
// If NOT in test mode, initialize DB and start the server.
if (process.env.NODE_ENV !== 'test') {
  initDB_passengers()
    .then(() => initDB_flight_passengers_assignments())
    .then(() => initDB_infant_parent_relationship())
    .then(() => initDB_seat_type())
    .then(() => initDB_affiliated_seating())
    .then(async () => {
      // Only run seeds if not in production mode
      if (process.env.NODE_ENV !== "production") {
        console.log("🌱 Seeding data...");
        try {
          await seedPassengers();
          await seedAffiliations();
          await seedSeatType();
          await seedAssignments();
          await seedInfants();
          console.log("✅ Seeding completed.");
        } catch (seedError) {
          console.error("⚠️ Seeding warning:", seedError);
          // We don't exit here so the server can still start even if seeding fails (e.g. duplicates)
        }
      }

      app.listen(PORT, () => {
        console.log(`🧳 Passenger Service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to start Passenger Service:", err);
      process.exit(1);
    });
}

// Export app for testing purposes (Supertest uses this)
export default app;