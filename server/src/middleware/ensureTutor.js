// src/middleware/ensureTutor.js

module.exports = function ensureTutor(req, res, next) {
  if (req.user.rol !== 'tutor') {
    return res.status(403).json({
      success: false,
      message: 'Solo los tutores pueden acceder a este recurso'
    });
  }
  next();
};
