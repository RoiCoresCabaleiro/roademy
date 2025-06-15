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
      return res.status(404).json({ success:false, message:'Nivel no encontrado' });
    }

    // 2) Nivel desbloqueado?
    const accesibles = await progresoService.getAccessibleLevels(usuarioId);
    if (!accesibles.has(nivelId)) {
      return res.status(403).json({ success:false, message:'Nivel bloqueado' });
    }

    // 3) Lo guardamos en req para que el controlador lo use si lo necesita
    req.nivel = nivel;
    next();
  } catch(err) {
    next(err);
  }
};
