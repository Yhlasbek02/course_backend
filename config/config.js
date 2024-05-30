const Sequelize = require('sequelize');

const sequelize = new Sequelize('attendance', 'postgres', '0104', {
  dialect: 'postgres',
  host: 'localhost',
  logging: console.log, // Enable logging to see the SQL queries being executed
});

module.exports = sequelize;
