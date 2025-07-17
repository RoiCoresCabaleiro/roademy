// server/src/middleware/ensureMinijuegoAccessible.js

const { Minijuego } = require("../models");
const progresoService = require("../services/progresoService");

module.exports = async function ensureMinijuegoAccessible(req, res, next) {
  try {
    const minijuegoId = Number(req.params.id);
    if (Number.isNaN(minijuegoId)) {
      const err = new Error("ID de minijuego inválido.");
      err.status = 400;
      return next(err);
    }

    const juego = await Minijuego.findByPk(minijuegoId);
    if (!juego) {
      const err = new Error("Minijuego no encontrado.");
      err.status = 404;
      return next(err);
    }

    const nivelesEstado = await progresoService.getNivelesEstado(req.user.id);
    const completados = new Set(nivelesEstado.filter(n => n.completado).map(n => n.nivelId));

    if (!completados.has(juego.nivelDesbloqueo)) {
      const err = new Error("Este minijuego aún no está desbloqueado.");
      err.status = 403;
      return next(err);
    }

    // Guardar el minijuego para no repetir la consulta en los controllers
    req.minijuego = juego; 
    next();
  } catch (err) {
    next(err);
  }
};
