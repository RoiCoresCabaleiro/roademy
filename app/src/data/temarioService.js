import temario from './temario.front.json';

/**
 * Devuelve el array de temas del JSON, con sus niveles y metadatos.
 */
export function getTemas() {
  return temario.temas;
}

/**
 * Busca en todos los temas el nivel con nivelId = Number(nivelId)
 * Devuelve { tema, nivel } o null si no existe.
 */
export function getNivelData(nivelId) {
  for (const tema of temario.temas) {
    const nivel = tema.niveles.find(n => n.nivelId === Number(nivelId));
    if (nivel) return { tema, nivel };
  }
  return null;
}
