// server/src/middleware/validators/index.js

const usuarioValidators = require("./usuarioValidators");
const claseValidators = require("./claseValidators");

module.exports = {
  ...usuarioValidators,
  ...claseValidators,
};
