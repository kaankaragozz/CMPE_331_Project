// =====================
// Library Imports
// =====================
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

// =====================
// Config & Routes
// =====================
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// =====================
// DB
// =====================
import { initDB_users } from "./db/initDB_users.js";
import { seedUsers } from "./seeds/users.js";

// =====================
// Environment
// =====================
dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// =====================
// Middleware
// =====================
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// =====================
// Health Check (VERY IMPORTANT for microservices)
// =====================
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "Auth Service",
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// =====================
// Server Start
// =====================
initDB_users()
  .then(async () => {
    if (process.env.NODE_ENV !== "production") {
      await seedUsers();
    }

    app.listen(PORT, () => {
      console.log(`🔐 Auth Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start Auth Service:", err);
    process.exit(1);
  });
