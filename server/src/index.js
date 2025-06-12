// server/src/index.js

require("dotenv").config();
const { sequelize } = require("./models");
const { seedData } = require("./seed");
const app = require("./app");
require("./cron/cleanupRefreshTokens");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.sync({ force: true });

    // Sembrar datos iniciales
    await seedData();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

start();
