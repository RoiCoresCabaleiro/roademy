const { ProgresoUsuarioMinijuego } = require("../models");
const minijuegoService = require("../services/minijuegoService");
const activityLogService = require("../services/activityLogService");

/**
 * Lista todos los minijuegos disponibles del usuario.
 */
async function listarMinijuegos(req, res, next) {
  try {
    const usuarioId = req.user.id;

    // Obtener información básica de minijuegos
    const minijuegos = await minijuegoService.getMinijuegosBasicos(usuarioId);

    // Obtener progreso del usuario en minijuegos
    const progresos = await ProgresoUsuarioMinijuego.findAll({
      where: { usuarioId },
    });
    const progresoMap = new Map(progresos.map((p) => [p.minijuegoId, p]));

    // Enriquecer minijuegos desbloqueados con puntuación
    const resultado = minijuegos.map((j) => ({
      ...j,
      ...(j.desbloqueado && progresoMap.has(j.id)
        ? { puntuacion: progresoMap.get(j.id).puntuacion }
        : {}),
    }));

    return res.json({ success: true, minijuegos: resultado });
  } catch (err) {
    next(err);
  }
}

/**
 * Completa un minijuego y actualiza la puntuación del usuario.
 */
async function completeMinijuego(req, res, next) {
  try {
    const usuarioId = req.user.id;
    const minijuegoId = req.minijuego.id;
    const nuevaPuntuacion = Number(req.body.puntuacion);

    let progreso = await ProgresoUsuarioMinijuego.findOne({
      where: { usuarioId, minijuegoId },
    });

    const mejorPuntuacionAnterior = progreso?.puntuacion ?? null;
    const mejorado =
      mejorPuntuacionAnterior === null ||
      nuevaPuntuacion > mejorPuntuacionAnterior;

    if (progreso) {
      if (mejorado) {
        progreso.puntuacion = nuevaPuntuacion;
        await progreso.save();
      }
    } else {
      progreso = await ProgresoUsuarioMinijuego.create({
        usuarioId,
        minijuegoId,
        puntuacion: nuevaPuntuacion,
      });
    }

    await activityLogService.logMinijuegoAttempt(
      usuarioId,
      minijuegoId,
      nuevaPuntuacion
    );

    return res.json({
      success: true,
      puntuacion: nuevaPuntuacion,
      mejorPuntuacion: progreso.puntuacion,
      mejorado,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarMinijuegos, completeMinijuego };
