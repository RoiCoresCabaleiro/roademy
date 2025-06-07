// src/middleware/validators.js

const { body, validationResult } = require("express-validator");

const validateRegister = [
  // nombre: string alfanumérico, no vacío
  body("nombre")
    .trim()
    .notEmpty().withMessage("Por favor, introduzca un nombre de usuario.")
    .isAlphanumeric().withMessage("El nombre de usuario solo puede contener letras y números.")
    .isLength({ min: 3, max: 30 }).withMessage("El nombre de usuario debe tener entre 3 y 30 caracteres."),

  // email: formato email válido, no vacío
  body("email")
    .trim()
    .notEmpty().withMessage("Por favor, introduzca un email.")
    .isEmail().withMessage("Por favor, introduzca un email válido.")
    .isLength({ min: 5, max: 60 }).withMessage("El email debe tener entre 5 y 60 caracteres."),

  // contraseña: no vacía, longitud mínima
  body("contraseña")
    .notEmpty().withMessage("Por favor, introduzca una contraseña.")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres."),

  body("rol")
    .notEmpty().withMessage("Por favor, seleccione un rol.")
    .isIn(["estudiante", "tutor"]).withMessage("Rol inválido."),

  // Recolecta errores y responde si los hay
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

const validateLogin = [
  // identifier: nombre de usuario o email, no vacío
  body("identifier")
    .trim()
    .notEmpty().withMessage("Por favor, introduzca un nombre de usuario o un email."),

  // contraseña: no vacía
  body("contraseña")
    .notEmpty().withMessage("Por favor, introduzca una contraseña."),

  // Recolecta errores y responde si los hay
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

module.exports = {
  validateRegister,
  validateLogin,
};
