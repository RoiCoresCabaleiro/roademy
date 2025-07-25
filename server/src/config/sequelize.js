// server/src/config/sequelize.js

const { Sequelize } = require("sequelize");
const { dbConfig } = require("./index");

const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, dbConfig.options)
  : new Sequelize(
      dbConfig.options.database,
      dbConfig.options.username,
      dbConfig.options.password,
      dbConfig.options
    );

module.exports = sequelize;
