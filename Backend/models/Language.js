const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Language = sequelize.define('Language', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  iso_code: {
    type: DataTypes.STRING(2),
    allowNull: true
  }
}, {
  tableName: 'languages',
  timestamps: false
});

module.exports = Language;
