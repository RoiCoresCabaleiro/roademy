// server/src/controllers/progresoController.js

const { PreguntaSolucion, ProgresoUsuarioNivel, ProgresoRespuesta, ActivityLogTemaComplete } = require("../models");
const progresoService = require("../services/progresoService");
const activityLogService = require("../services/activityLogService");
const { fn, col, literal } = require("sequelize");

/**
 * GET /api/v1/progresos/:nivelId/init
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
      const err = new Error("La pregunta no existe o no pertenece a este nivel");
      err.status = 404;
      return next(err);
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
      const err = new Error("Ya has respondido esta pregunta en el intento actual");
      err.status = 400;
      return next(err);
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
    const [{ total, aciertos }] = await ProgresoRespuesta.findAll({
      where: { progresoId: prog.id },
      attributes: [
        [fn("COUNT", col("id")), "total"],
        [fn("SUM", literal("CASE WHEN correcta THEN 1 ELSE 0 END")), "aciertos"]
      ],
      raw: true
    });
    const totalRespuestas = parseInt(total, 10);
    const correctas = parseInt(aciertos, 10);

    return res.json({
      success: true,
      correcta,
      totalRespondidas: totalRespuestas,
      aciertos: correctas,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/progresos/:nivelId/complete
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
      const err = new Error("Debes responder al menos una pregunta antes de completar el nivel.");
      err.status = 400;
      return next(err);
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
      attemptNota = totalPreguntas > 0 ? Math.round((aciertos / totalPreguntas) * 100) : 0;
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

    // 5) Registrar intento de nivel
    const puntuacionAttempt = req.nivel.tipo === "leccion" ? attemptEstrellas : attemptNota;
    await activityLogService.logNivelAttempt(
      usuarioId,
      nivelId,
      attemptCompletado,
      puntuacionAttempt,
      prog.intentos
    );
    
    // 6) Detectar y registrar tema completado
    const nivelesEstado = await progresoService.getNivelesEstado(usuarioId);
    const temasEstado   = await progresoService.computeTemasEstado(nivelesEstado);
    const estadoTema = temasEstado.find((t) => t.temaId === req.nivel.temaId);
    if (
      ActivityLogTemaComplete.findOne({
        where: { usuarioId, temaId: req.nivel.temaId },
      }) &&
      estadoTema.completados === estadoTema.totalNiveles &&
      estadoTema.estrellasObtenidas >= estadoTema.estrellasNecesarias
    ) {
      await activityLogService.logTemaCompletion(usuarioId, req.nivel.temaId);
    }

    // 7) Construir la respuesta
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
    if (mejorado && prog.intentos > 1) {
      payload.mejorado = true;
    }
    return res.json(payload);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/progresos/usuario/roadmap
 * Devuelve el estado de **todos** los niveles y un resumen por tema.
 */
async function getRoadmap(req, res, next) {
  try {
    const usuarioId = req.user.id;

    // Obtenemos el contexto
    const nivelesEstado = await progresoService.getNivelesEstado(usuarioId);
    const temasEstado   = await progresoService.computeTemasEstado(nivelesEstado);
    const { nivelActual } = progresoService.computeNivelActualYAccesibles(nivelesEstado, temasEstado);

    // Preparamos la lista de niveles para el front
    const niveles = nivelesEstado.map((n) => ({
      nivelId: n.nivelId,
      temaId: n.temaId,
      tipo: n.tipo,
      completado: n.completado,
      ...(n.tipo === "leccion" ? { estrellas: n.estrellas } : { nota: n.nota }),
      intentos: n.intentos,
      enCurso: n.enCurso,
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
};
