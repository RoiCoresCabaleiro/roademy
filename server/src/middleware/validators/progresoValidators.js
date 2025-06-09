// server/src/middleware/validators/progresoValidators.js

const { param, body, validationResult } = require('express-validator');

const validateNivelId = [
  param('nivelId')
    .isInt({ gt: 0 }).withMessage('nivelId debe ser un entero positivo.'),
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errs.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    next();
  }
];

const validateAnswer = [
  body('preguntaId')
    .isInt({ gt: 0 }).withMessage('preguntaId debe ser un entero positivo.'),
  body('seleccion')
    .isInt({ min: 0 }).withMessage('seleccion debe ser un índice numérico.'),
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errs.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    next();
  }
];

module.exports = { validateNivelId, validateAnswer };
