// src/services/activityLogService.js

const { ProgresoUsuarioNivel, Nivel } = require("../models");

/**
 * Devuelve un log de actividad de completados para una lista de usuarios.
 */
async function getActivityLog(usuarioIds, limit = 50) {
  const completions = await ProgresoUsuarioNivel.findAll({
    where: { usuarioId: usuarioIds, completado: true },
    include: [{ model: Nivel, as: 'nivel', attributes: ["tipo"] }],
    order: [["completedAt", "DESC"]],
    limit,
  });

  return completions.map((c) => ({
    alumnoId: c.usuarioId,
    nivelId: c.nivelId,
    tipo: c.nivel.tipo,
    ...(c.nivel.tipo === "leccion" ? { estrellas: c.estrellas ?? 0 } : { nota: c.nota ?? 0 }),
    completedAt: c.completedAt,
  }));
}

module.exports = { getActivityLog };
