// server/src/controllers/progresoController.js

const { Tema, Nivel, PreguntaSolucion, ProgresoUsuarioNivel, ProgresoRespuesta } = require("../models");

// Helper para construir el contexto del roadmap
async function buildContext(usuarioId) {
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

/**
 * GET /api/v1/progresos/:nivelId/init
 * ────────────────────────────────
 * Recupera o inicializa el progreso del usuario en ese nivel,
 * junto con todas las respuestas parciales guardadas.
 */
async function iniciarNivel(req, res, next) {
  try {
    const usuarioId = req.user.id;
    const nivelId = Number(req.params.nivelId);

    // 1) Obtener o crear registro maestro
    let prog = await ProgresoUsuarioNivel.findOne({
      where: { usuarioId, nivelId },
    });
    if (!prog) {
      prog = await ProgresoUsuarioNivel.create({ usuarioId, nivelId });
    }

    // 2) Cargar respuestas parciales
    const respuestas = await ProgresoRespuesta.findAll({
      where: { progresoId: prog.id },
      attributes: ["preguntaId", "seleccion", "correcta", "respondidoAt"],
      order: [["respondidoAt", "ASC"]],
    });

    // 3) Determinar si está "en curso"
    const enCurso = respuestas.length > 0;

    return res.json({
      success: true,
      nivelId,
      enCurso,
      respuestas,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/progresos/:nivelId/answer
 * ───────────────────────────────────────
 * Valida e inserta/actualiza una única respuesta a una pregunta.
 */
async function answerPregunta(req, res, next) {
  try {
    const usuarioId = req.user.id;
    const nivelId = Number(req.params.nivelId);
    const { preguntaId, seleccion } = req.body;

    // 1) Validar solución en servidor y pertenencia a nivel
    const sol = await PreguntaSolucion.findOne({
      where: { preguntaId, nivelId },
    });
    if (!sol) {
      return res.status(400).json({
        success: false,
        message: "La pregunta no existe o no pertenece a este nivel",
      });
    }
    const correcta = sol.respuestaCorrecta === seleccion;

    // 2) Crear o restaurar progreso maestro
    let prog = await ProgresoUsuarioNivel.findOne({
      where: { usuarioId, nivelId },
    });
    if (!prog) {
      prog = await ProgresoUsuarioNivel.create({ usuarioId, nivelId });
    }

    // 3) Evitar sobreescritura de respuestas
    const exist = await ProgresoRespuesta.findOne({
      where: { progresoId: prog.id, preguntaId },
    });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Ya has respondido esta pregunta en el intento actual",
      });
    }

    // 4) Insertar o actualizar respuesta
    await ProgresoRespuesta.create({
      progresoId: prog.id,
      preguntaId,
      seleccion,
      correcta,
      respondidoAt: new Date(),
    });

    // 5) Contar parciales y aciertos
    const totalResp = await ProgresoRespuesta.count({
      where: { progresoId: prog.id },
    });
    const aciertos = await ProgresoRespuesta.count({
      where: { progresoId: prog.id, correcta: true },
    });

    return res.json({
      success: true,
      correcta,
      totalRespondidas: totalResp,
      aciertos,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/progresos/:nivelId/complete
 * ─────────────────────────────────────────
 * Marca un intento como completado, calcula estrellas/nota,
 * borra respuestas parciales y actualiza intentos.
 */
async function completeNivel(req, res, next) {
  try {
    const usuarioId = req.user.id;
    const nivelId = Number(req.params.nivelId);

    let prog = await ProgresoUsuarioNivel.findOne({
      where: { usuarioId, nivelId },
    });
    if (!prog) {
      prog = await ProgresoUsuarioNivel.create({ usuarioId, nivelId });
    }

    // 1) Comprobar que hay al menos una respuesta
    const respuestas = await ProgresoRespuesta.count({
      where: { progresoId: prog.id },
    });
    if (respuestas === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Debes responder al menos una pregunta antes de completar el nivel.",
      });
    }
    const aciertos = await ProgresoRespuesta.count({
      where: { progresoId: prog.id, correcta: true },
    });

    // 2) Incrementar intentos
    prog.intentos = (prog.intentos || 0) + 1;

    // 3) Calcular resultado
    let attemptEstrellas, attemptNota;
    let attemptCompletado = false;
    let mejorado = false;

    if (req.nivel.tipo === "leccion") {
      attemptEstrellas = Math.min(3, aciertos);
      attemptCompletado = aciertos >= 1;
      mejorado = attemptEstrellas > (prog.estrellas || 0);
      if (mejorado) prog.estrellas = attemptEstrellas;
    } else {
      const totalPreguntas = await PreguntaSolucion.count({
        where: { nivelId },
      });
      attemptNota =
        totalPreguntas > 0 ? Math.round((aciertos / totalPreguntas) * 100) : 0;
      attemptCompletado = attemptNota >= req.nivel.puntuacionMinima;
      mejorado = attemptNota > (prog.nota || 0);
      if (mejorado) prog.nota = attemptNota;
    }
    prog.completado = prog.completado || attemptCompletado;

    if (attemptCompletado && (!prog.completedAt || mejorado)) {
      prog.completedAt = new Date();
    }

    // 4) Guardar y limpiar parciales
    await prog.save();
    await ProgresoRespuesta.destroy({ where: { progresoId: prog.id } });

    // 6) Construir la respuesta
    const payload = {
      success: true,
      nivelId,
      intentos: prog.intentos,
      attemptCompletado, // si el intento actual aprobó
      completado: prog.completado, // si alguna vez completó
    };
    if (req.nivel.tipo === "leccion") {
      payload.attemptEstrellas = attemptEstrellas;
      payload.bestEstrellas = prog.estrellas ?? 0;
    } else {
      payload.attemptNota = attemptNota;
      payload.bestNota = prog.nota ?? 0;
    }
    if (mejorado) {
      payload.mejorado = true;
    }
    return res.json(payload);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/progresos/usuario/roadmap
 * ──────────────────────────────────────────
 * Devuelve el estado de **todos** los niveles y un resumen por tema.
 */
async function getRoadmap(req, res, next) {
  try {
    const usuarioId = req.user.id;

    // Obtenemos el contexto
    const { nivelesEstado, temasEstado, nivelActual, partialLevels } =
      await buildContext(usuarioId);

    // Preparamos la lista de niveles para el front
    const niveles = nivelesEstado.map((n) => ({
      nivelId: n.nivelId,
      temaId: n.temaId,
      tipo: n.tipo,
      completado: n.completado,
      ...(n.tipo === "leccion" ? { estrellas: n.estrellas } : { nota: n.nota }),
      intentos: n.intentos,
      enCurso: partialLevels.has(n.nivelId),
    }));

    return res.json({
      success: true,
      nivelActual,
      niveles,
      temas: temasEstado,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  iniciarNivel,
  answerPregunta,
  completeNivel,
  getRoadmap,
  buildContext,
};
