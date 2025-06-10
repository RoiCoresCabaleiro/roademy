// src/middleware/ensureClaseAccessible.js
const { Clase, Usuario } = require('../models');

module.exports = async function ensureClaseAccessible(req, res, next) {
  const userId  = req.user.id;
  const userRol = req.user.rol;
  const claseId = Number(req.params.id || req.params.claseId);

  try {
    const clase = await Clase.findByPk(claseId);
    if (!clase) {
      return res.status(404).json({ success: false, message: 'Clase no encontrada.' });
    }

    // Si es tutor, debe ser propietario
    if (userRol === 'tutor') {
      if (clase.tutorId !== userId) {
        return res.status(403).json({ success: false, message: 'No tienes permiso sobre esta clase.' });
      }
    }
    // Si es estudiante, debe pertenecer a la clase
    else if (userRol === 'estudiante') {
      const usuario = await Usuario.findByPk(userId);
      if (usuario.claseId !== clase.id) {
        return res.status(403).json({ success: false, message: 'No tienes permiso para ver esta clase.' });
      }
    }
    // Rol inesperado
    else {
      return res.status(403).json({ success: false, message: 'Rol no autorizado.' });
    }

    // Guardamos la clase para el controller
    req.clase = clase;
    next();
  } catch (err) {
    next(err);
  }
};