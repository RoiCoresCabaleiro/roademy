// server/src/controllers/claseController.js

const { Clase, Usuario } = require("../models");
const progresoService = require('../services/progresoService');
const activityLogService = require("../services/activityLogService");
const generateUniqueCode = require('../utils/generateUniqueCode');

/**
 * Crea una nueva clase para el tutor autenticado.
 * - Genera automáticamente un código alfanumérico único (6 caracteres).
 */
// POST /api/v1/clases - Crea una nueva clase (solo para tutores)
async function crearClase(req, res, next) {
  try {
    const existente = await Clase.findOne({
      where: { tutorId: req.user.id, nombre: req.body.nombre },
    });
    if (existente) {
      return res.status(409).json({
        success: false,
        message: "Ya tienes otra clase con ese nombre.",
      });
    }

    // Generar un código único
    const codigo = await generateUniqueCode(6);

    // Crear la clase
    const nueva = await Clase.create({
      nombre: req.body.nombre,
      codigo,
      tutorId: req.user.id,
    });
    return res.status(201).json({
      success: true,
      clase: {
        id: nueva.id,
        nombre: nueva.nombre,
        codigo: nueva.codigo,
        tutorId: nueva.tutorId,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Lista todas las clases creadas por el tutor autenticado.
 */
// GET /api/v1/clases - Lista todas las clases del tutor autenticado
async function listarClases(req, res, next) {
  try {
    const clases = await Clase.findAll({
      where: { tutorId: req.user.id },
      include: [
        {
          model: Usuario,
          as: "estudiantes",
          attributes: ["id"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const resultado = clases.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      codigo: c.codigo,
      numEstudiantes: c.estudiantes.length, // Número de estudiantes de cada clase
    }));
    return res.json({ success: true, clases: resultado });
  } catch (err) {
    next(err);
  }
}

/**
 * Devuelve los detalles de una clase específica (tutor o estudiante).
 */
// GET /api/v1/clases/:id
async function verClase(req, res, next) {
  try {
    const clase = await Clase.findByPk(req.clase.id, {
      include: [
        { model: Usuario, as: "tutor", attributes: ["id", "nombre", "email"] },
        {
          model: Usuario,
          as: "estudiantes",
          attributes: ["id", "nombre", "email"],
        },
      ],
    });

    // Calcular porcentaje de progreso total de cada estudiante
    const estudiantes = await Promise.all(
      clase.estudiantes.map(async u => {
        const nivelesEstado = await progresoService.getNivelesEstado(u.id);
        const { estrellasPosiblesCurso } = await progresoService.getTotalCourseStars();

        const estrellasObtenidasCurso = nivelesEstado.reduce((sum, n) => sum + (n.estrellas || 0), 0);
        const porcentajeProgresoTotal = estrellasPosiblesCurso ? Math.round((estrellasObtenidasCurso / estrellasPosiblesCurso) * 100) : 0;
        return {
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          estrellasObtenidasCurso,
          estrellasPosiblesCurso,
          porcentajeProgresoTotal
        };
      })
    );

    // Solo si el que llama es tutor, añadimos log de actividad
    let actividadReciente = [];
    if (req.user.rol === "tutor") {
      const usuarioIds = clase.estudiantes.map((u) => u.id);
      actividadReciente = await activityLogService.getActivityLog({
        usuarioIds,
        types: ['nivel','tema'],
        invertOrder: false,
        limit: 50
      });
    }

    return res.json({
      success: true,
      clase: {
        id: clase.id,
        nombre: clase.nombre,
        codigo: clase.codigo,
        numEstudiantes: clase.estudiantes.length,
        tutor: clase.tutor, // { id, nombre, email }
      },
      estudiantes, // [ { id, nombre, email, porcentajeProgreso }, ... ]
      actividadReciente,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Actualiza el nombre de una clase o genera un nuevo nombre,
 * si el tutor autenticado es el propietario.
 */
// PUT /api/v1/clases/:id - Actualiza nombre de la clase
async function actualizarClase(req, res, next) {
  try {
    const clase = req.clase;
    if (req.body.nombre !== clase.nombre) {
      const dup = await Clase.findOne({
        where: { tutorId: req.user.id, nombre: req.body.nombre },
      });
      if (dup) {
        return res.status(409).json({
          success: false,
          message: "Ya tienes otra clase con ese nombre.",
        });
      }
      clase.nombre = req.body.nombre;
      await clase.save();
    }
    return res.json({
      success: true,
      clase: {
        id: clase.id,
        nombre: clase.nombre,
        codigo: clase.codigo,
        tutorId: clase.tutorId,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Permite al tutor expulsar a un estudiante de su clase.
 * - Pone claseId = null al usuario indicado.
 */
// DELETE /api/v1/clases/:claseId/estudiantes/:userId
async function eliminarEstudiante(req, res, next) {
  try {
    const alumno = await Usuario.findByPk(req.params.userId);
    if (!alumno || alumno.claseId !== req.clase.id) {
      return res.status(400).json({
        success: false,
        message: "El alumno no pertenece a esta clase.",
      });
    }
    await alumno.update({ claseId: null });
    return res.json({
      success: true,
      message: `El estudiante ${alumno.nombre} ha sido expulsado de la clase.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Permite al tutor eliminar una clase de la que es propietario.
 */
// DELETE /api/v1/clases/:id - Elimina una clase
async function eliminarClase(req, res, next) {
  try {
    await req.clase.destroy();
    return res.json({
      success: true,
      message: "Clase eliminada correctamente.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearClase,
  listarClases,
  verClase,
  actualizarClase,
  eliminarEstudiante,
  eliminarClase,
};
