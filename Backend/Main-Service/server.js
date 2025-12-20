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
// Generic Proxy Helper Function
// =====================
/**
 * Proxies requests to microservices
 * @param {string} baseUrl - Base URL of the target service
 * @param {string} targetPath - Path to forward to (without base URL)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} serviceName - Name of the service for error messages
 */
const proxyRequest = async (baseUrl, targetPath, req, res, serviceName) => {
  try {
    // Validate base URL
    if (!baseUrl) {
      throw new Error(`${serviceName} URL not configured`);
    }

    // Clean up the URL to remove double slashes
    const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    const cleanPath = targetPath.replace(/^\/+/, ''); // Remove leading slashes
    const targetUrl = `${cleanBaseUrl}/${cleanPath}`.replace(/([^:]\/)\/+/g, '$1'); // Remove double slashes

    // Prepare headers - exclude Host header and other problematic headers
    const headers = { ...req.headers };
    delete headers.host; // Remove Host header to avoid conflicts
    delete headers.connection; // Remove connection header
    delete headers['content-length']; // Let Axios calculate content-length

    // Only forward relevant headers
    const cleanHeaders = {
      'content-type': headers['content-type'] || 'application/json',
      'accept': headers['accept'] || 'application/json',
    };

    // Forward authorization if present
    if (headers['authorization']) {
      cleanHeaders['authorization'] = headers['authorization'];
    }

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
      headers: cleanHeaders,
      timeout: 30000, // 30 second timeout
      validateStatus: () => true, // Don't throw on any status code
    });

    // Forward response status and data
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(`${serviceName} proxy error for ${req.method} ${req.originalUrl}:`, err.message);

    // Determine appropriate status code
    let statusCode = 500;
    if (err.response?.status) {
      statusCode = err.response.status;
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      statusCode = 503; // Service unavailable
    } else if (err.code === 'ENOTFOUND') {
      statusCode = 503; // Service not found
    }

    res.status(statusCode).json({
      error: `${serviceName} error`,
      message: err.response?.data?.message || err.message,
      details: err.response?.data || (process.env.NODE_ENV === 'development' ? err.stack : undefined),
    });
  }
};

// =====================
// Auth Service Proxy
// =====================
// Proxy for /api/auth routes (signup, login)
app.use("/api/auth", async (req, res) => {
  const targetPath = req.originalUrl; // forwards /api/auth/*
  await proxyRequest(AUTH_SERVICE, targetPath, req, res, "Auth Service");
});

// Proxy for /api/users routes
app.use("/api/users", async (req, res) => {
  const targetPath = req.originalUrl; // forwards /api/users
  await proxyRequest(AUTH_SERVICE, targetPath, req, res, "Auth Service");
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
  "/api/crew-assignments",
];

crewServiceRoutes.forEach((route) => {
  app.use(route, async (req, res) => {
    // Use originalUrl to get the full path including query string
    const targetPath = req.originalUrl;
    await proxyRequest(CREW_SERVICE, targetPath, req, res, "Crew Service");
  });
});

// =====================
// Flight Service Proxy
// =====================
const flightServiceRoutes = [
  "/api/airports",
  "/api/flights",
  "/api/vehicle-types",

  "/api/flight_recipes"
];

flightServiceRoutes.forEach((route) => {
  app.use(route, async (req, res) => {
    // Use originalUrl to get the full path including query string
    const targetPath = req.originalUrl;
    await proxyRequest(FLIGHT_SERVICE, targetPath, req, res, "Flight Service");
  });
});

// =====================
// Passenger Service Proxy
// =====================
app.use("/api/passengers", async (req, res) => {
  const targetPath = req.originalUrl; // use originalUrl
  await proxyRequest(PASSENGER_SERVICE, targetPath, req, res, "Passenger Service");
});


// =====================
// Server Start
// =====================
app.listen(PORT, () => {
  console.log(`🌐 Main Service running on port ${PORT}`);
});
