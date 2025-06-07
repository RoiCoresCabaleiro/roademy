// server/src/middleware/validators/claseValidators.js

const { body, param, validationResult } = require('express-validator');


const validateCrearClase = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('Por favor, introduzca un nombre para la clase.')
    .isLength({ min: 3, max: 50 })
      .withMessage('El nombre de la clase debe tener entre 3 y 50 caracteres.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

const validateIdParam = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El parámetro id debe ser un entero positivo.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];


const validateEliminarEstudiante = [
  param("claseId")
    .isInt({ gt: 0 }).withMessage("El parámetro claseId debe ser un entero positivo."),
  param("userId")
    .isInt({ gt: 0 }).withMessage("El parámetro userId debe ser un entero positivo."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];


module.exports = { validateCrearClase, validateIdParam, validateEliminarEstudiante };