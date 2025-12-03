const Pilot = require('../models/Pilot');
const { Op } = require('sequelize');

// Get all pilots
const getAllPilots = async (req, res) => {
  try {
    const pilots = await Pilot.findAll({
      order: [['id', 'ASC']]
    });
    res.status(200).json({
      success: true,
      count: pilots.length,
      data: pilots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pilots',
      error: error.message
    });
  }
};

// Filter pilots by vehicle_restriction and/or seniority_level
const filterPilots = async (req, res) => {
  try {
    const { vehicle_restriction, seniority_level } = req.query;
    
    const whereClause = {};
    
    if (vehicle_restriction) {
      whereClause.vehicle_restriction = vehicle_restriction;
    }
    
    if (seniority_level) {
      whereClause.seniority_level = seniority_level;
    }
    
    const pilots = await Pilot.findAll({
      where: whereClause,
      order: [['id', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: pilots.length,
      filters: {
        vehicle_restriction: vehicle_restriction || 'all',
        seniority_level: seniority_level || 'all'
      },
      data: pilots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error filtering pilots',
      error: error.message
    });
  }
};

// Create a new pilot
const createPilot = async (req, res) => {
  try {
    const { name, age, gender, nationality, vehicle_restriction, allowed_range, seniority_level } = req.body;
    
    // Validation
    if (!name || !age || !gender || !nationality || !vehicle_restriction || !allowed_range || !seniority_level) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, age, gender, nationality, vehicle_restriction, allowed_range, seniority_level'
      });
    }
    
    if (!['Senior', 'Junior', 'Trainee'].includes(seniority_level)) {
      return res.status(400).json({
        success: false,
        message: 'seniority_level must be one of: Senior, Junior, Trainee'
      });
    }
    
    const pilot = await Pilot.create({
      name,
      age,
      gender,
      nationality,
      vehicle_restriction,
      allowed_range,
      seniority_level
    });
    
    res.status(201).json({
      success: true,
      message: 'Pilot created successfully',
      data: pilot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating pilot',
      error: error.message
    });
  }
};

module.exports = {
  getAllPilots,
  filterPilots,
  createPilot
};




