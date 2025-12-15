// =====================
// Imports
// =====================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import axios from "axios";

// =====================
// Environment
// =====================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middleware
// =====================
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// =====================
// Service URLs
// =====================
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;
const CREW_SERVICE = process.env.CREW_SERVICE_URL;
const FLIGHT_SERVICE = process.env.FLIGHT_SERVICE_URL;

// =====================
// Health Check
// =====================
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "Main Service",
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// Auth Service Proxy
// =====================
app.use("/api/auth", async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${AUTH_SERVICE}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: "Auth Service error",
      details: err.response?.data || err.message,
    });
  }
});

// =====================
// Crew Service Proxy
// =====================
app.use("/api/crew", async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${CREW_SERVICE}${req.url}`, // 👈 NOT req.originalUrl
      data: req.body,
      headers: req.headers,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: "Crew Service error",
      details: err.response?.data || err.message,
    });
  }
});

// =====================
// Flight Service Proxy
// =====================
app.use("/api/flight", async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${FLIGHT_SERVICE}${req.url}`, // 👈 NOT req.originalUrl
      data: req.body,
      headers: req.headers,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: "Flight Service error",
      details: err.response?.data || err.message,
    });
  }
});

// =====================
// Server Start
// =====================
app.listen(PORT, () => {
  console.log(`🌐 Main Service running on port ${PORT}`);
});
