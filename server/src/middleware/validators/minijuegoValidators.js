// server/src/middleware/validators/minijuegoValidators.js

const { body, param, validationResult } = require("express-validator");

const validateCompleteMinijuego = [
  param("id")
    .isInt({ gt: 0 }).withMessage("El ID del minijuego debe ser un entero positivo.")
    .toInt(),
  body("puntuacion")
    .isInt({ min: 0 }).withMessage("La puntuación debe ser un número entero positivo."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    next();
  }
];

module.exports = { validateCompleteMinijuego };
