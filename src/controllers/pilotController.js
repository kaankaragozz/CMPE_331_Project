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

// Get a single pilot by ID
const getPilotById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pilot = await Pilot.findByPk(id, {
      include: [
        {
          model: Language,
          as: 'languages',
          attributes: ['name'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!pilot) {
      return res.status(404).json({
        success: false,
        message: `Pilot with ID ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: pilot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pilot',
      error: error.message
    });
  }
};

// Update a pilot by ID
const updatePilot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, nationality, vehicle_restriction, allowed_range, seniority_level, languages } = req.body;
    
    const pilot = await Pilot.findByPk(id);
    
    if (!pilot) {
      return res.status(404).json({
        success: false,
        message: `Pilot with ID ${id} not found`
      });
    }
    
    // Validate seniority_level if provided
    if (seniority_level && !['Senior', 'Junior', 'Trainee'].includes(seniority_level)) {
      return res.status(400).json({
        success: false,
        message: 'seniority_level must be one of: Senior, Junior, Trainee'
      });
    }
    
    // Update pilot fields
    if (name !== undefined) pilot.name = name;
    if (age !== undefined) pilot.age = age;
    if (gender !== undefined) pilot.gender = gender;
    if (nationality !== undefined) pilot.nationality = nationality;
    if (vehicle_restriction !== undefined) pilot.vehicle_restriction = vehicle_restriction;
    if (allowed_range !== undefined) pilot.allowed_range = allowed_range;
    if (seniority_level !== undefined) pilot.seniority_level = seniority_level;
    
    await pilot.save();
    
    // Handle languages association if provided
    if (Array.isArray(languages)) {
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
        
        await pilot.setLanguages(languageInstances);
      } else {
        // If empty array provided, remove all language associations
        await pilot.setLanguages([]);
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
    
    res.status(200).json({
      success: true,
      message: 'Pilot updated successfully',
      data: pilotWithLanguages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating pilot',
      error: error.message
    });
  }
};

// Delete a pilot by ID
const deletePilot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pilot = await Pilot.findByPk(id);
    
    if (!pilot) {
      return res.status(404).json({
        success: false,
        message: `Pilot with ID ${id} not found`
      });
    }
    
    await pilot.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Pilot deleted successfully',
      data: { id: parseInt(id) }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting pilot',
      error: error.message
    });
  }
};

module.exports = {
  getAllPilots,
  filterPilots,
  createPilot,
  getPilotById,
  updatePilot,
  deletePilot
};




