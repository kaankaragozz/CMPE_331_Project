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
const PASSENGER_SERVICE = process.env.PASSENGER_SERVICE_URL;

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
app.use("/api/users", async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${AUTH_SERVICE}${req.originalUrl}`, // forwards /api/users
      data: req.body,
      headers: req.headers,
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
const crewServiceRoutes = [
  "/api/attendant-types",
  "/api/cabin-crew",
  "/api/cabin-crew-vehicle-restrictions",
  "/api/dish-recipes",
  "/api/pilots",
  "/api/pilots-languages",
];

crewServiceRoutes.forEach((route) => {
  app.use(route, async (req, res) => {
    try {
      // If req.url is '/', don't add extra slash
      const pathSuffix = req.url === "/" ? "" : req.url;
      const forwardUrl = `${CREW_SERVICE}${route}${pathSuffix}`;
      console.log("Forwarding to Crew Service:", forwardUrl);

      const response = await axios({
        method: req.method,
        url: forwardUrl,
        data: req.body,
        headers: req.headers,
      });

      res.status(response.status).json(response.data);
    } catch (err) {
      console.error("Crew Service proxy error:", err.message);
      res.status(err.response?.status || 500).json({
        error: "Crew Service error",
        details: err.response?.data || err.message,
      });
    }
  });
});
// =====================
// Flight Service Proxy
// =====================
const flightServiceRoutes = [
  "/api/airports",
  "/api/flights",
  "/api/vehicle-types",
];

flightServiceRoutes.forEach((route) => {
  app.use(route, async (req, res) => {
    try {
      // Forward to Flight Service with full path
      const forwardUrl = `${FLIGHT_SERVICE}${route}${req.url}`;
      console.log("Forwarding to Flight Service:", forwardUrl);

      const response = await axios({
        method: req.method,
        url: forwardUrl,
        data: req.body,
        headers: req.headers,
      });

      res.status(response.status).json(response.data);
    } catch (err) {
      console.error("Flight Service proxy error:", err.message);
      res.status(err.response?.status || 500).json({
        error: "Flight Service error",
        details: err.response?.data || err.message,
      });
    }
  });
});

// Passenger Service Proxy
app.use("/api/passengers", async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${PASSENGER_SERVICE}${req.originalUrl}`, // use originalUrl
      data: req.body,
      headers: req.headers,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: "Passenger Service error",
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
