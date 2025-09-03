module.exports = function ensureEstudiante(req, res, next) {
  if (req.user.rol !== 'estudiante') {
    const err = new Error('Acceso denegado: solo estudiantes pueden acceder a este recurso.');
    err.status = 403;
    return next(err);
  }
  next();
};