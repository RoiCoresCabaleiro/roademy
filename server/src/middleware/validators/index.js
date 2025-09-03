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
