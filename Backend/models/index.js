const sequelize = require('../config/db');
const Pilot = require('./Pilot');
const Language = require('./Language');

// Associations
Pilot.belongsToMany(Language, {
  through: 'PilotLanguages',
  as: 'languages',
  foreignKey: 'pilotId',
  otherKey: 'languageId'
});

Language.belongsToMany(Pilot, {
  through: 'PilotLanguages',
  as: 'pilots',
  foreignKey: 'languageId',
  otherKey: 'pilotId'
});

module.exports = {
  sequelize,
  Pilot,
  Language
};
