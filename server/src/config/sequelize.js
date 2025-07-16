// server/src/config/sequelize.js

require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    timezone: "+02:00",
    logging: false,
    define: {
      underscored: true,
    },
  }
);

module.exports = sequelize;
