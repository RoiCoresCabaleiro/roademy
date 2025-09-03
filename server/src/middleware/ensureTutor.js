module.exports = function ensureTutor(req, res, next) {
  if (req.user.rol !== 'tutor') {
    const err = new Error('Acceso denegado: solo tutores pueden acceder a este recurso.');
    err.status = 403;
    return next(err);
  }
  next();
};
