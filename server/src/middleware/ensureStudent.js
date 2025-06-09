// server/src/middleware/ensureStudent.js

module.exports = function ensureStudent(req, res, next) {
  if (req.user.rol !== 'estudiante') {
    return res.status(403).json({
      success: false,
      message: 'Solo los estudiantes pueden acceder a este recurso'
    });
  }
  next();
};