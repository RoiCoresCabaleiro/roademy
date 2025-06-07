// server/src/utils/generateCode.js

function randomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  for (;;) {
    code = Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
    return code; // se asume que quien lo llama comprueba unicidad
  }
}

module.exports = randomCode;
