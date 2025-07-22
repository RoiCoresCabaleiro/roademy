// server/src/config/sequelize.js

//require("dotenv").config();
const { Sequelize } = require("sequelize");

const url = process.env.MYSQL_URL;
if (!url) {
  console.error('❌ ERROR: no se encontró MYSQL_URL en las variables de entorno');
  process.exit(1);
}

const sequelize = new Sequelize(
  url,
  //process.env.DB_NAME,
  //process.env.DB_USER,
  //process.env.DB_PASS,
  {
    //host: process.env.DB_HOST,
    dialect: "mysql",
    //port: process.env.DB_PORT || 3306,
    timezone: "+02:00",
    logging: false,
    define: {
      underscored: true,
    },
  }
);

module.exports = sequelize;
