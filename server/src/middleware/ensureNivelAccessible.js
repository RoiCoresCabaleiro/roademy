// server/src/middleware/ensureNivelAccessible.js

const { Nivel } = require('../models');
const progresoService = require('../services/progresoService');

module.exports = async function ensureNivelAccessible(req, res, next) {
  try {
    const usuarioId = req.user.id;
    const nivelId   = Number(req.params.nivelId);

    // 1) Nivel existe?
    const nivel = await Nivel.findByPk(nivelId);
    if (!nivel) {
      const err = new Error('Nivel no encontrado.');
      err.status = 404;
      return next(err);
    }

    // 2) Nivel desbloqueado?
    const accesibles = await progresoService.getAccessibleNiveles(usuarioId);
    if (!accesibles.has(nivelId)) {
      const err = new Error('Nivel bloqueado. Desbloquea el nivel anterior para acceder a este.');
      err.status = 403;
      return next(err);
    }

    // 3) Lo guardamos en req para que el controlador lo use si lo necesita
    req.nivel = nivel;
    next();
  } catch(err) {
    next(err);
  }
};
