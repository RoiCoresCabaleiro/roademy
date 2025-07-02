// src/utils/formatters.js

/**
 * Dado un nivelId como número o string (por ej. 101, 202, 1203),
 * devuelve "tema.nivel" quitando ceros a la izda.
 */
export function formatNivelId(nivelId) {
  const id = String(nivelId);
  let tema, nivel;
  
  if (id.length === 3) {
    //TNN (3 dígitos)  Ej: "101" → tema=1, nivel=01 → "1.1"
    tema = Number(id[0]);
    nivel = Number(id.slice(1));
  }
  else if (id.length === 4) {
    //TTNN (4 dígitos)  Ej: "1001" → tema=10, nivel=01 → "10.1"
    tema = Number(id.slice(0, 2));
    nivel = Number(id.slice(2));
  }
  else return null;

  return `${tema}.${nivel}`;
}