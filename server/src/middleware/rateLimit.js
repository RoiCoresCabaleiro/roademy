const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Demasiados intentos de login desde esta IP. Vuelve a intentarlo en 15 minutos.'
  }
});

const registerLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Demasiados registros desde esta IP, prueba de nuevo en 30 minutos.'
  }
});

module.exports = { loginLimiter, registerLimiter };