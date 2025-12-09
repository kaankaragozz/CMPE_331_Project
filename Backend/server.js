const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pilotRoutes = require('./routes/Pilot/pilotRoutes');
const initDB = require('./db/initDB');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/pilots', pilotRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pilot Information API is running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Pilot Information API',
    endpoints: {
      getAllPilots: 'GET /api/pilots',
      filterPilots: 'GET /api/pilots/filter?vehicle_restriction=Boeing 737&seniority_level=Senior',
      createPilot: 'POST /api/pilots'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Pilot Information API server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
