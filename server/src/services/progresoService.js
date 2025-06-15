// server/src/services/progresoService.js

const { Nivel, Tema, ProgresoUsuarioNivel, ProgresoRespuesta } = require('../models');

/**
 * 1) Obtiene el estado de cada nivel para un usuario:
 *    - completado, estrellas, nota, intentos, enCurso
 */
async function getNivelesEstado(usuarioId) {
  // 1a) Cargar TODOS los niveles
  const niveles = await Nivel.findAll({
    attributes: ["id", "temaId", "tipo", "orden"],
    order: [
      ["temaId", "ASC"],
      ["orden", "ASC"]
    ]
  });

  // 1b) Cargar progresos del usuario
  const progresos = await ProgresoUsuarioNivel.findAll({
    where: { usuarioId },
    attributes: ["id", "nivelId", "completado", "estrellas", "nota", "intentos"]
  });

  // Mapear progresos por nivelId
  const progMap = progresos.reduce((m, p) => {
    m[p.nivelId] = p;
    return m;
  }, {});

  // 1c) Niveles “en curso” (respuestas parciales)
  const rows = await ProgresoRespuesta.findAll({
    where: { progresoId: progresos.map((p) => p.id) },
    attributes: ["progresoId"],
    group: ["progresoId"],
    raw: true,
  });
  const partialLevels = new Set(rows.map((r) => progresos.find((p) => p.id === r.progresoId).nivelId));

  // 1d) Construir array de estados de los niveles
  return niveles.map((n) => {
    const prog = progMap[n.id] || {};
    return {
      nivelId: n.id,
      temaId: n.temaId,
      tipo: n.tipo,
      completado: Boolean(prog.completado),
      estrellas: prog.estrellas ?? 0,
      nota: prog.nota ?? 0,
      intentos: prog.intentos ?? 0,
      enCurso: partialLevels.has(n.id),
    };
  });
}

/**
 * 2) A partir de nivelesEstado, calcula para cada tema:
 *    - totalNiveles, completados, estrellasObtenidas, estrellasPosibles
 */
async function computeTemasEstado(nivelesEstado) {
  // 2a) Cargar datos estáticos de los temas
  const temas = await Tema.findAll({
    attributes: ["id", "estrellasNecesarias", "titulo", "orden"],
    order: [["orden", "ASC"]],
  });

  // 2b) Primera pasada: métricas parciales
  const temasParcial = temas.map((t) => {
    const relacionados = nivelesEstado.filter((n) => n.temaId === t.id);
    const lecciones = relacionados.filter((n) => n.tipo === "leccion");
    const estrellasObtenidas = lecciones.reduce((sum, n) => sum + n.estrellas, 0);
    return {
      temaId: t.id,
      titulo: t.titulo,
      totalNiveles: relacionados.length,
      completados: relacionados.filter((n) => n.completado).length,
      estrellasObtenidas,
      estrellasPosibles: lecciones.length * 3,
      estrellasNecesarias: t.estrellasNecesarias,
    };
  });

  // 2c) Segunda pasada: desbloqueo
  return temasParcial.map((tp, idx) => {
    if (idx === 0) {
      return { ...tp, desbloqueado: true };
    }
    const prev = temasParcial[idx - 1];
    const desbloqueado =
      prev.estrellasObtenidas >= tp.estrellasNecesarias &&
      prev.completados === prev.totalNiveles;
    return { ...tp, desbloqueado };
  });
}

/**
 * 3) A partir de nivelesEstado y temasEstado, determina:
 *    - nivelActual (primer no completado y desbloqueado)
 *    - accesibles  (set de nivelId al que puede acceder)
 */
function computeNivelActualYAccesibles(nivelesEstado, temasEstado) {
  // 3a) Nivel actual: el primero no completado si perteneciente a un tema desbloqueado (si no, null)
  const nivelActualEntry = nivelesEstado.find(n => {
    const tema = temasEstado.find(t => t.temaId === n.temaId);
    return !n.completado && tema.desbloqueado;
  });
  const nivelActual = nivelActualEntry ? nivelActualEntry.nivelId : null;

  // 3b) Accesibles: todos ya completados + el actual si existe
  const accesibles = new Set(nivelesEstado.filter((n) => n.completado).map((n) => n.nivelId));
  if (nivelActual) {
    accesibles.add(nivelActual);
  }
  return { nivelActual, accesibles };
}

/**
 * 4) nº total de estrellas posibles en todo el curso
 */
async function getTotalCourseStars() {
  const totalLecciones = await Nivel.count({ where: { tipo: "leccion" } });
  const estrellasPosiblesCurso = totalLecciones * 3;
  return { estrellasPosiblesCurso };
}

/**
 * Orquestador para obtener el contexto completo del usuario:
 * - nivelesEstado
 * - temasEstado
 * - nivelActual
 * - accesibles
 * - estrellasPosiblesCurso
 */
async function getContext(usuarioId) {
  // 1) Niveles
  const nivelesEstado = await getNivelesEstado(usuarioId);

  // 2) Temas
  const temasEstado = await computeTemasEstado(nivelesEstado);

  // 3) Nivel actual y accesibles
  const { nivelActual, accesibles } = computeNivelActualYAccesibles(nivelesEstado, temasEstado);

  // 4) Estadísticas globales
  const { estrellasPosiblesCurso } = await getTotalCourseStars();

  return {
    nivelesEstado,
    temasEstado,
    nivelActual,
    accesibles,
    estrellasPosiblesCurso,
  };
}

/**
 * Devuelve unicamente los niveles accesibles para un usuario.
 */
async function getAccessibleLevels(usuarioId) {
  const nivelesEstado = await getNivelesEstado(usuarioId);
  const temasEstado   = await computeTemasEstado(nivelesEstado);
  const { accesibles } = computeNivelActualYAccesibles(nivelesEstado, temasEstado);
  return accesibles;
}

module.exports = {
  getNivelesEstado,
  computeTemasEstado,
  computeNivelActualYAccesibles,
  getTotalCourseStars,
  getContext,
  getAccessibleLevels,
};