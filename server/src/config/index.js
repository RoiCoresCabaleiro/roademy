// src/config/index.js

const dbConfig = (() => {
  // En prod con Raiway, usar url completa (MYSQL_URL):
  if (process.env.MYSQL_URL) {
    return {
      url: process.env.MYSQL_URL,
      options: {
        dialect: "mysql",
        timezone: "+02:00",
        logging: false,
        define: { underscored: true },
      },
    };
  }

  // En dev (o si no hay MYSQL_URL), construir desde vars individuales:
  return {
    url: null,
    options: {
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      dialect: "mysql",
      timezone: "+02:00",
      logging: false,
      define: { underscored: true },
    },
  };
})();

module.exports = { dbConfig };
