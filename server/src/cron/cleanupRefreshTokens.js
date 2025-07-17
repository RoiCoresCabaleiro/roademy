// src/cron/cleanupRefreshTokens.js

const cron = require("node-cron");
const { Op } = require("sequelize");
const { RefreshToken } = require("../models");

// Retención: cuántos días conservar tokens expirados
const RETENTION_DAYS = 14;

// Función que limpia la tabla
async function cleanupRefreshTokens() {
  const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const deletedCount = await RefreshToken.destroy({
    where: {
      [Op.or]: [{ revoked: true }, { expiresAt: { [Op.lt]: cutoffDate } }],
    },
  });
  console.log(`Cron cleanup: borrados ${deletedCount} refresh tokens inválidos.`);
  return deletedCount;
}

// Cron job: "0 0 * * *" = cada día a medianoche se eliminan los tokens que lleven más de "RETENTION_DAYS" días expirados/revocados
cron.schedule("0 0 * * *", () => {
    console.log("Ejecutando limpieza diaria de refresh tokens...");
    cleanupRefreshTokens().catch(console.error);
},{
    timezone: "Europe/Madrid",
  }
);

module.exports = cleanupRefreshTokens;
