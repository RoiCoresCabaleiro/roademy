// src/middleware/ensureClaseAccessible.js

const { Clase, Usuario } = require('../models');

module.exports = async function ensureClaseAccessible(req, res, next) {
  try {
    const userId  = req.user.id;
    const userRol = req.user.rol;
    const claseId = Number(req.params.id || req.params.claseId);

    const clase = await Clase.findByPk(claseId);
    if (!clase) {
      const err = new Error('Clase no encontrada.');
      err.status = 404;
      return next(err);
    }

    // Si es tutor, debe ser propietario
    if (userRol === 'tutor') {
      if (clase.tutorId !== userId) {
        const err = new Error('No tienes permiso sobre esta clase.');
        err.status = 403;
        return next(err);
      }
    }
    // Si es estudiante, debe pertenecer a la clase
    else if (userRol === 'estudiante') {
      const usuario = await Usuario.findByPk(userId);
      if (usuario.claseId !== clase.id) {
        const err = new Error('No tienes permiso para ver esta clase.');
        err.status = 403;
        return next(err);
      }
    }
    // Rol inesperado
    else {
      const err = new Error('Rol no autorizado.');
      err.status = 403;
      return next(err);
    }

    // Se guarda la clase para los controllers posteriores y asi no hacer otra consulta
    req.clase = clase;
    next();
  } catch (err) {
    next(err);
  }
};