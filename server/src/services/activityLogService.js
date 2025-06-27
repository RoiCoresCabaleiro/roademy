// src/services/activityLogService.js

const { ActivityLogNivel, ActivityLogTemaComplete } = require("../models");
const sequelize = require("../config/sequelize");
const { QueryTypes } = require("sequelize");

// Registra un intento de nivel
async function logNivelAttempt(usuarioId, nivelId, completado, puntuacion, intento) {
  return ActivityLogNivel.create({
    usuarioId,
    nivelId,
    completado,
    puntuacion,
    intento
  });
}

// Registra el momento en el que se completa un tema
async function logTemaCompletion(usuarioId, temaId) {
  return ActivityLogTemaComplete.findOrCreate({
    where: { usuarioId, temaId },
    defaults: { usuarioId, temaId }
  });
}

// Devuelve un log de actividad para una lista de usuarios.
async function getActivityLog({ usuarioIds, types=['nivel','tema'], invertOrder = false, limit = 50 }) {
  // Si no hay alumnos, no hacemos ninguna consulta
  if (!Array.isArray(usuarioIds) || usuarioIds.length === 0) {
    return [];
  }
  const binds = { usuarioIds };

  // Armamos las partes de UNION según types
  const parts = [];
  if (types.includes("nivel")) {
    parts.push(`
      SELECT
        a.usuario_id  AS usuarioId,
        'nivel'       AS logTipo,
        a.nivel_id    AS referenciaId,
        n.tipo        AS nivelTipo,
        a.completado,
        a.puntuacion,
        a.intento,
        a.created_at AS createdAt
      FROM activity_log_nivel a
      JOIN niveles n ON a.nivel_id = n.id
      WHERE usuario_id IN (:usuarioIds)
    `);
  }
  if (types.includes("tema")) {
    parts.push(`
      SELECT
        usuario_id AS usuarioId,
        'tema'     AS logTipo,
        tema_id    AS referenciaId,
        NULL       AS nivelTipo,
        NULL       AS completado,
        NULL       AS puntuacion,
        NULL       AS intento,
        created_at AS createdAt
      FROM activity_log_tema_complete
      WHERE usuario_id IN (:usuarioIds)
    `);
  }

  let sql = parts.join("UNION ALL") + `
    ORDER BY
      createdAt DESC,
      CASE WHEN logTipo = 'tema' THEN 1 ELSE 0 END DESC
  `;

  // Aplicamos LIMIT si limit > 0  ;  limit = 0 -> ver logs enteros
  if (limit > 0) {
    sql += ` LIMIT :limit`;
    binds.limit = limit;
  }

  const rawLogs = await sequelize.query(sql, {
    replacements: binds,
    type: QueryTypes.SELECT,
  });

  // Mapeo y posible inversión
  let logs = rawLogs.map((r) => ({
    usuarioId: r.usuarioId,
    logTipo: r.logTipo,
    referenciaId: r.referenciaId,
    ...(r.logTipo === "nivel" && {
      nivelTipo:  r.nivelTipo,
      completado: Boolean(r.completado),
      puntuacion: r.puntuacion,
      intento: r.intento,
    }),
    createdAt: r.createdAt,
  }));

  if (invertOrder) logs = logs.reverse();

  return logs;
}

module.exports = { getActivityLog, logNivelAttempt, logTemaCompletion };
