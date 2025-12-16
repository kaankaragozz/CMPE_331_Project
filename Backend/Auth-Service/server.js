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
// Environment
// =====================
dotenv.config();

const app = express();

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
    service: "Auth Service",
    status: "UP"
  });
});

// =====================
// Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

export default app; // ✅ ONLY export app
