const crypto = require("crypto");
const { Clase } = require("../models");

/**
 * Genera un string aleatorio de mayúsculas y dígitos de longitud `length`.
 */
function randomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const idx = crypto.randomInt(0, chars.length);
    code += chars[idx];
  }
  return code;
}

/**
 * Genera un código único comprobando en la tabla Clase.
 * Repite hasta encontrar uno que no exista.
 */
async function generateUniqueCode(length = 6) {
  let code;
  let exists;
  do {
    code = randomCode(length);
    exists = await Clase.findOne({ where: { codigo: code } });
  } while (exists);
  return code;
}

module.exports = generateUniqueCode;
