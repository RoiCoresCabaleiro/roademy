const { ActivityLogNivel, ActivityLogTemaComplete, ActivityLogMinijuego } = require("../models");
const sequelize = require("../config/sequelize");
const { QueryTypes } = require("sequelize");


// Registra un intento de nivel
async function logNivelAttempt(usuarioId, nivelId, completado, puntuacion, intento) {
  return ActivityLogNivel.create({
    usuarioId,
    nivelId,
    completado,
    puntuacion,
    intento
  });
}


// Registra el momento en el que se completa un tema
async function logTemaCompletion(usuarioId, temaId) {
  return ActivityLogTemaComplete.findOrCreate({
    where: { usuarioId, temaId },
    defaults: { usuarioId, temaId }
  });
}


// Registra un intento de minijuego
async function logMinijuegoAttempt(usuarioId, minijuegoId, puntuacion) {
  return ActivityLogMinijuego.create({
    usuarioId,
    minijuegoId,
    puntuacion
  });
}


// Devuelve un log de actividad para una lista de usuarios.
async function getActivityLog({ usuarioIds, types=['nivel','tema', "minijuego"], invertOrder = false, limit = 50 }) {
  // Si no hay alumnos, no hacemos ninguna consulta
  if (!Array.isArray(usuarioIds) || usuarioIds.length === 0) {
    return [];
  }
  const binds = { usuarioIds };

  // Armamos las partes de UNION según types
  const parts = [];
  if (types.includes("nivel")) {
    parts.push(`
      SELECT
        a.usuario_id  AS usuarioId,
        'nivel'       AS logTipo,
        a.nivel_id    AS referenciaId,
        NULL          AS minijuegoNombre,
        n.tipo        AS nivelTipo,
        a.completado,
        a.puntuacion,
        a.intento,
        a.created_at AS createdAt
      FROM activity_log_nivel a
      JOIN niveles n ON a.nivel_id = n.id
      WHERE usuario_id IN (:usuarioIds)
    `);
  }
  if (types.includes("tema")) {
    parts.push(`
      SELECT
        usuario_id AS usuarioId,
        'tema'     AS logTipo,
        tema_id    AS referenciaId,
        NULL       AS minijuegoNombre,
        NULL       AS nivelTipo,
        NULL       AS completado,
        NULL       AS puntuacion,
        NULL       AS intento,
        created_at AS createdAt
      FROM activity_log_tema_complete
      WHERE usuario_id IN (:usuarioIds)
    `);
  }
  if (types.includes("minijuego")) {
    parts.push(`
      SELECT
      m.usuario_id     AS usuarioId,
      'minijuego'      AS logTipo,
      m.minijuego_id   AS referenciaId,
      j.nombre         AS minijuegoNombre,
      NULL             AS nivelTipo,
      NULL             AS completado,
      m.puntuacion     AS puntuacion,
      NULL             AS intento,
      m.created_at     AS createdAt
    FROM activity_log_minijuego m
    JOIN minijuegos j ON m.minijuego_id = j.id
    WHERE m.usuario_id IN (:usuarioIds)
    `);
  }

  let sql = parts.join("UNION ALL") + `
    ORDER BY
      createdAt DESC,
      CASE WHEN logTipo = 'tema' THEN 1 ELSE 0 END DESC
  `;

  // Aplicamos LIMIT si limit > 0  ;  limit = 0 -> ver logs enteros
  if (limit > 0) {
    sql += ` LIMIT :limit`;
    binds.limit = limit;
  }

  const rawLogs = await sequelize.query(sql, {
    replacements: binds,
    type: QueryTypes.SELECT,
  });

  // Mapeo y posible inversión
  let logs = rawLogs.map((r) => ({
    usuarioId: r.usuarioId,
    logTipo: r.logTipo,
    referenciaId: r.referenciaId,
    ...(r.logTipo === "nivel" && {
      nivelTipo:  r.nivelTipo,
      completado: Boolean(r.completado),
      puntuacion: r.puntuacion,
      intento: r.intento,
    }),
    ...(r.logTipo === "minijuego" && {
      nombre: r.minijuegoNombre,
      puntuacion: r.puntuacion,
    }),
    createdAt: r.createdAt,
  }));

  if (invertOrder) logs = logs.reverse();

  return logs;
}


// Devuelve datos para gráfico de actividad semanal por clase de un tutor
async function getWeeklyClassActivityByTutor(tutorId, numWeeks = 5) {
  // 1) Calcular rango [from, to) de 5 semanas completas (lunes 00:00 → lunes 00:00)
  const now = new Date();
  const day = now.getDay();
  const daysToNextMonday = ((8 - day) % 7) || 7;
  const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToNextMonday);
  toDate.setHours(0, 0, 0, 0);

  const fromDate = new Date(toDate);
  fromDate.setDate(fromDate.getDate() - 7 * numWeeks);

  const pad = n => String(n).padStart(2, "0");
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 00:00:00`;

  const from = fmt(fromDate);
  const to   = fmt(toDate);

  // 2) Consultar clases del tutor
  const clases = await sequelize.query(
    `
    SELECT id AS clase_id, nombre AS nombre_clase
    FROM clases
    WHERE tutor_id = :tutorId
    ORDER BY id
    `,
    { replacements: { tutorId }, type: QueryTypes.SELECT }
  );

  // Sin clases → no hay nada que dibujar en el gráfico
  if (clases.length === 0) {
    return { chartData: [] };
  }

  // 3) Agregar por semana ISO y clase, rellenando semanas sin actividad con 0
  const rows = await sequelize.query(
    `
    WITH RECURSIVE weeks AS (
      SELECT DATE(:from) AS week_start
      UNION ALL
      SELECT DATE_ADD(week_start, INTERVAL 7 DAY)
      FROM weeks
      WHERE DATE_ADD(week_start, INTERVAL 7 DAY) < :to
    ),
    tutor_clases AS (
      SELECT id AS clase_id, nombre AS nombre_clase
      FROM clases
      WHERE tutor_id = :tutorId
    ),
    union_logs AS (
      SELECT u.clase_id, n.created_at
      FROM activity_log_nivel n
      JOIN usuarios u ON u.id = n.usuario_id
      JOIN clases   c ON c.id = u.clase_id
      WHERE c.tutor_id = :tutorId

      UNION ALL

      SELECT u.clase_id, t.created_at
      FROM activity_log_tema_complete t
      JOIN usuarios u ON u.id = t.usuario_id
      JOIN clases   c ON c.id = u.clase_id
      WHERE c.tutor_id = :tutorId

      UNION ALL

      SELECT u.clase_id, m.created_at
      FROM activity_log_minijuego m
      JOIN usuarios u ON u.id = m.usuario_id
      JOIN clases   c ON c.id = u.clase_id
      WHERE c.tutor_id = :tutorId
    ),
    bounded_logs AS (
      SELECT *
      FROM union_logs
      WHERE created_at >= :from AND created_at < :to
    ),
    agg AS (
      SELECT
        DATE_FORMAT(created_at, '%x-%v') AS periodo,
        clase_id,
        COUNT(*) AS total_registros
      FROM bounded_logs
      GROUP BY periodo, clase_id
    )
    SELECT
      DATE_FORMAT(w.week_start, '%x-%v') AS periodo,
      tc.clase_id,
      tc.nombre_clase,
      COALESCE(a.total_registros, 0)     AS total_registros
    FROM weeks w
    CROSS JOIN tutor_clases tc
    LEFT JOIN agg a
      ON a.periodo = DATE_FORMAT(w.week_start, '%x-%v')
     AND a.clase_id = tc.clase_id
    ORDER BY w.week_start ASC, tc.clase_id ASC
    `,
    {
      replacements: { tutorId, from, to },
      type: QueryTypes.SELECT,
    }
  );

  // 4) Transformar a { periodo, registrosPorClase: [...] }
  const byPeriodo = new Map();
  for (const r of rows) {
    if (!byPeriodo.has(r.periodo)) byPeriodo.set(r.periodo, []);
    byPeriodo.get(r.periodo).push({
      claseId: r.clase_id,
      nombreClase: r.nombre_clase,
      totalRegistros: Number(r.total_registros),
    });
  }

  const chartData = Array.from(byPeriodo.entries()).map(([periodo, registrosPorClase]) => ({
    periodo,
    registrosPorClase: registrosPorClase.sort((a, b) => a.claseId - b.claseId),
  }));

  return { chartData };
}


module.exports = { getActivityLog, getWeeklyClassActivityByTutor, logNivelAttempt, logTemaCompletion, logMinijuegoAttempt };
