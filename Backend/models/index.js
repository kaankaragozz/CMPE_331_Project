import { sequelize } from '../config/db.js';
import Pilot from './Pilot.js';
import Language from './Language.js';

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

export {
  sequelize,
  Pilot,
  Language
};
