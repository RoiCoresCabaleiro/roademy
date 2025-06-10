// server/src/middleware/validators/index.js

const usuarioValidators = require("./usuarioValidators");
const claseValidators = require("./claseValidators");
const progresoValidators  = require("./progresoValidators");

module.exports = {
  ...usuarioValidators,
  ...claseValidators,
  ...progresoValidators
};
