require("dotenv").config();
const { sequelize } = require("./models");
const { seedData } = require("./seed");
const app = require("./app");
require("./cron/cleanupRefreshTokens");

const PORT = +process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "prod";

async function waitForDb(retries = 8, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("DB connected");
      return;
    } catch (err) {
      console.warn(`DB connect attempt ${i + 1}/${retries} failed: ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay * Math.pow(1.5, i)));
    }
  }
}

async function start() {
  try {
    await waitForDb(Number(process.env.DB_CONNECT_RETRIES || 8), Number(process.env.DB_CONNECT_DELAY_MS || 2000));

    if (!isProd) {
      // Dev: permitimos que Sequelize adapte el esquema (útil en desarrollo)
      console.log("Development mode: running sequelize.sync({ alter: true })");
      await sequelize.sync({ alter: true });
    } else {
      // Producción: no forzar alteraciones automáticas. Crear tablas si no existen, pero sin modificar esquema existente.
      console.log("Production mode: running sequelize.sync()");
      await sequelize.sync(); // o considerar skip entirely and use migrations
    }

    // Sembrado: solo si la tabla existe y no hay registros
    try {
      const { Tema } = require("./models");
      const count = await Tema.count();
      if (count === 0) {
        console.log("Seeding initial data...");
        await seedData();
      }
    } catch (err) {
      // Si aún no existe la tabla, manejamos el error de forma segura.
      console.warn("Skipping seed: could not count Tema (table may not exist yet):", err.message);
    }

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

start();
