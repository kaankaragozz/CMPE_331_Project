const { Pilot, Language } = require('../models');
const { Op } = require('sequelize');

// Get all pilots
const getAllPilots = async (req, res) => {
  try {
    const pilots = await Pilot.findAll({
      order: [['id', 'ASC']],
      include: [
        {
          model: Language,
          as: 'languages',
          attributes: ['name'],
          through: { attributes: [] }
        }
      ]
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
      order: [['id', 'ASC']],
      include: [
        {
          model: Language,
          as: 'languages',
          attributes: ['name'],
          through: { attributes: [] }
        }
      ]
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
    const { name, age, gender, nationality, vehicle_restriction, allowed_range, seniority_level, languages } = req.body;
    
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

    // Handle languages association if provided
    if (Array.isArray(languages) && languages.length > 0) {
      // Normalize language names (trim and filter out empty values)
      const normalized = [...new Set(languages
        .map(lang => (typeof lang === 'string' ? lang.trim() : ''))
        .filter(lang => lang.length > 0))];

      if (normalized.length > 0) {
        const languageInstances = await Promise.all(
          normalized.map(async (name) => {
            const [language] = await Language.findOrCreate({
              where: { name }
            });
            return language;
          })
        );

        await pilot.addLanguages(languageInstances);
      }
    }

    // Reload pilot with languages included
    const pilotWithLanguages = await Pilot.findByPk(pilot.id, {
      include: [
        {
          model: Language,
          as: 'languages',
          attributes: ['name'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Pilot created successfully',
      data: pilotWithLanguages
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




