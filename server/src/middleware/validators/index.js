// server/src/middleware/validators/index.js

const usuarioValidators = require("./usuarioValidators");
const claseValidators = require("./claseValidators");
const progresoValidators = require("./progresoValidators");
const minijuegoValidators = require("./minijuegoValidators");

module.exports = {
  ...usuarioValidators,
  ...claseValidators,
  ...progresoValidators,
  ...minijuegoValidators,
};
