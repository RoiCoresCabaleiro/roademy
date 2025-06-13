// server/src/services/progresoService.js

const { ProgresoUsuarioNivel, ProgresoRespuesta, Tema, Nivel } = require('../models');

async function getContext(usuarioId) {
  // 1) Niveles y progreso
  const niveles = await Nivel.findAll({
    attributes: ["id", "temaId", "tipo", "orden"],
    order: [
      ["temaId", "ASC"],
      ["orden", "ASC"],
    ],
  });
  const progresos = await ProgresoUsuarioNivel.findAll({
    where: { usuarioId },
    attributes: ["id", "nivelId", "completado", "estrellas", "nota", "intentos"],
  });

  // 2) Mapear progresos por nivelId
  const progMap = progresos.reduce((m, p) => {
    m[p.nivelId] = p;
    return m;
  }, {});
  const idToNivel = new Map(progresos.map(p => [p.id, p.nivelId]));
  const rows = await ProgresoRespuesta.findAll({
    where: { progresoId: progresos.map((p) => p.id) },
    attributes: ["progresoId"],
    group: ["progresoId"],
    raw: true,
  });
  // Niveles enCurso (con respuestas parciales)
  const partialLevels = new Set(rows.map(r => idToNivel.get(r.progresoId)));

  // 3) Construir nivelesEstados
  const nivelesEstado = niveles.map((n) => {
    const prog = progMap[n.id] || {};
    return {
      nivelId: n.id,
      temaId: n.temaId,
      tipo: n.tipo,
      completado: !!prog.completado,
      estrellas: prog.estrellas ?? 0,
      nota: prog.nota ?? 0,
      intentos: prog.intentos ?? 0,
      enCurso: partialLevels.has(n.id),
    };
  });

  // 2) Temas y desbloqueo
  const temas = await Tema.findAll({
    attributes: ["id", "estrellasNecesarias", "titulo", "orden"],
    order: [["orden", "ASC"]],
  });

  // Primera pasada: métricas
  const temasParcial = temas.map((t) => {
    const relacionados = nivelesEstado.filter((n) => n.temaId === t.id);
    const lecciones = relacionados.filter((n) => n.tipo === "leccion");
    const estrellasObtenidas = lecciones.reduce((sum, n) => sum + n.estrellas, 0);
    const estrellasPosibles = lecciones.length * 3;
    const completados = relacionados.filter((n) => n.completado).length;
    const totalNiveles = relacionados.length;
    return {
      temaId: t.id,
      titulo: t.titulo,
      totalNiveles,
      completados,
      estrellasObtenidas,
      estrellasPosibles,
    };
  });

  // Segunda pasada: desbloqueo
  const temasEstado = temasParcial.map((tp, idx) => {
    const estrellasNecesarias = temas[idx].estrellasNecesarias;
    const prev = temasParcial[idx - 1];
    const desbloqueado =
      idx === 0
        ? true
        : prev.estrellasObtenidas >= estrellasNecesarias &&
          prev.completados === prev.totalNiveles;
    return { ...tp, estrellasNecesarias, desbloqueado };
  });

  // 3) Nivel actual y accesibles
  const nivelActualEntry = nivelesEstado.find(
    (n) =>
      !n.completado &&
      temasEstado.find((t) => t.temaId === n.temaId).desbloqueado
  );
  const nivelActual = nivelActualEntry ? nivelActualEntry.nivelId : null;
  const accesibles = new Set(
    nivelesEstado.filter((n) => n.completado).map((n) => n.nivelId)
  );
  if (nivelActual) {
    accesibles.add(nivelActual);
  }

  // Total de estrellas posibles en el curso entero
  const totalLecciones = await Nivel.count({ where: { tipo: 'leccion' }});
  const estrellasPosiblesCurso = totalLecciones * 3;

  return { nivelesEstado, temasEstado, nivelActual, accesibles, partialLevels, estrellasPosiblesCurso };
}

module.exports = { getContext };