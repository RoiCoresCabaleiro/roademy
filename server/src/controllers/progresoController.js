// server/src/controllers/progresoController.js

const { Tema, Nivel, PreguntaSolucion, ProgresoUsuarioNivel, ProgresoRespuesta } = require("../models");

// Helper para construir el contexto del roadmap
async function buildContext(usuarioId) {
  // 1) Niveles y progreso
  const niveles = await Nivel.findAll({
    attributes: ['id','temaId'],
    order: [['temaId','ASC'],['orden','ASC']]
  });
  const progresos = await ProgresoUsuarioNivel.findAll({
    where: { usuarioId },
    attributes: ['nivelId','completado','estrellas']
  });
  const progMap = progresos.reduce((m,p) => {
    m[p.nivelId] = { completado: p.completado, estrellas: p.estrellas };
    return m;
  }, {});

  const nivelesEstado = niveles.map(n => ({
    nivelId:    n.id,
    temaId:     n.temaId,
    completado: !!progMap[n.id]?.completado,
    estrellas:  progMap[n.id]?.estrellas || 0
  }));

  // 2) Temas y desbloqueo
  const temas = await Tema.findAll({
    attributes: ['id','estrellasNecesarias'],
    order: [['orden','ASC']]
  });

  // Primera pasada: métricas
  const temasParcial = temas.map(t => {
    const relacionados = nivelesEstado.filter(n => n.temaId === t.id);
    const estrellasObtenidas = relacionados
      .reduce((sum, n) => sum + n.estrellas, 0);
    const completados = relacionados.filter(n => n.completado).length;
    return {
      temaId:           t.id,
      estrellasObtenidas,
      totalNiveles:     relacionados.length,
      completados
    };
  });

  // Segunda pasada: desbloqueo
  const temasEstado = temasParcial.map((tp, idx) => {
    const requisito = temas[idx].estrellasNecesarias;
    const desbloqueado = idx === 0
      ? true
      : temasParcial[idx - 1].estrellasObtenidas >= requisito;
    return { ...tp, desbloqueado };
  });

  // 3) Nivel actual y accesibles
  const nivelActualEntry = nivelesEstado.find(n => !n.completado && temasEstado.find(t => t.temaId === n.temaId).desbloqueado);
  const nivelActual = nivelActualEntry ? nivelActualEntry.nivelId : null;
  const accesibles = new Set(
    nivelesEstado
      .filter(n => temasEstado.find(t => t.temaId === n.temaId).desbloqueado)
      .map(n => n.nivelId)
  );

  return { nivelesEstado, temasEstado, nivelActual, accesibles };
}


/**
 * GET /progresos/:nivelId
 */
async function getProgresoNivel(req, res, next) {
  const usuarioId = req.user.id;
  const nivelId = Number(req.params.nivelId);

  try {
    // 1) Obtener o crear registro maestro
    let prog = await ProgresoUsuarioNivel.findOne({
      where: { usuarioId, nivelId },
    });
    if (!prog) {
      prog = await ProgresoUsuarioNivel.create({ usuarioId, nivelId });
    }

    // 2) Obtener todas las respuestas parciales
    const respuestas = await ProgresoRespuesta.findAll({
      where: { progresoId: prog.id },
      attributes: ["preguntaId", "seleccion", "correcta", "respondidoAt"],
      order: [["respondidoAt", "ASC"]],
    });

    // 3) Determinar si está "en curso"
    const respuestasCount = respuestas.length;
    const enCurso = respuestasCount > 0;

    return res.json({
      success: true,
      nivelId,
      enCurso,
      completado: prog.completado,
      estrellas: prog.estrellas || 0,
      nota: prog.nota || 0,
      intentos: prog.intentos,
      respuestas,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /progresos/:nivelId/answer
 */
async function answerPregunta(req, res, next) {
  const usuarioId = req.user.id;
  const nivelId = Number(req.params.nivelId);
  const { preguntaId, seleccion } = req.body;

  try {
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
 * POST /progresos/:nivelId/complete
 */
async function completeNivel(req, res, next) {
  const usuarioId = req.user.id;
  const nivelId = Number(req.params.nivelId);

  try {
    let prog = await ProgresoUsuarioNivel.findOne({
      where: { usuarioId, nivelId },
    });
    if (!prog) {
      prog = await ProgresoUsuarioNivel.create({ usuarioId, nivelId });
    }

    const total = await ProgresoRespuesta.count({
      where: { progresoId: prog.id },
    });
    const aciertos = await ProgresoRespuesta.count({
      where: { progresoId: prog.id, correcta: true },
    });

    // 2) Incrementar intentos
    prog.intentos++;

    // 3) Calcular resultado
    let completado = false,
      estrellas = null,
      nota = null;
    if (req.nivel.tipo === "leccion") {
      estrellas = Math.min(3, aciertos);
      completado = aciertos >= 1;
      if (estrellas > (prog.estrellas || 0)) prog.estrellas = estrellas;
    } else {
      nota = total > 0 ? Math.floor((aciertos / total) * 100) : 0;
      completado = nota >= req.nivel.puntuacionMinima;
      if (nota > (prog.nota || 0)) prog.nota = nota;
    }
    if (completado && !prog.completedAt) {
      prog.completedAt = new Date();
    }
    prog.completado = prog.completado || completado; // no se revierte

    // 4) Guardar y limpiar parciales
    await prog.save();
    await ProgresoRespuesta.destroy({ where: { progresoId: prog.id } });

    return res.json({
      success: true,
      nivelId,
      completado: prog.completado,
      estrellas: prog.estrellas,
      nota: prog.nota,
      intentos: prog.intentos,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/progresos/usuario/roadmap
 */
async function getRoadmap(req, res, next) {
  const usuarioId = req.user.id;

  try {
    // Obtenemos el contexto
    const { nivelesEstado, temasEstado, nivelActual } = await buildContext(usuarioId);

    return res.json({
      success: true,
      nivelActual,
      niveles: nivelesEstado,
      temas: temasEstado,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProgresoNivel,
  answerPregunta,
  completeNivel,
  getRoadmap,
};
