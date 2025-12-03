const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pilot = sequelize.define('Pilot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false
  },
  vehicle_restriction: {
    type: DataTypes.STRING,
    allowNull: false
  },
  allowed_range: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seniority_level: {
    type: DataTypes.ENUM('Senior', 'Junior', 'Trainee'),
    allowNull: false
  }
}, {
  tableName: 'pilots',
  timestamps: false
});

module.exports = Pilot;




