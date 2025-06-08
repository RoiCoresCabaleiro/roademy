// server/src/controllers/claseController.js

const { Clase, Usuario } = require("../models");
const randomCode = require("../utils/generateCode");

/**
 * Crea una nueva clase para el tutor autenticado.
 * - Genera automáticamente un código alfanumérico único (6 caracteres).
 * - Solo usuarios con rol 'tutor' pueden crear clases.
 */
// POST /api/v1/clases - Crea una nueva clase (solo para tutores)
async function crearClase(req, res, next) {
  const { nombre } = req.body;
  const tutorId = req.user.id;

  try {
    if (req.user.rol !== "tutor") {
      const err = new Error("Solo los tutores pueden crear clases.");
      err.status = 403;
      return next(err);
    }

    const existentePorNombre = await Clase.findOne({
      where: { tutorId, nombre },
    });
    if (existentePorNombre) {
      const err = new Error("Ya tienes otra clase con ese nombre.");
      err.status = 409;
      return next(err);
    }

    // Generar un código único
    let codigo, existe;
    do {
      codigo = randomCode(6);
      existe = await Clase.findOne({ where: { codigo } });
    } while (existe);

    // Crear la clase
    const nueva = await Clase.create({ nombre, codigo, tutorId });

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
  const tutorId = req.user.id;

  try {
    if (req.user.rol !== "tutor") {
      const err = new Error("Solo los tutores pueden ver sus clases.");
      err.status = 403;
      return next(err);
    }

    const clases = await Clase.findAll({
      where: { tutorId },
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
      numEstudiantes: c.estudiantes.length, // Número de estudiantes de cada clase
    }));

    return res.json({ success: true, clases: resultado });
  } catch (err) {
    next(err);
  }
}

/**
 * Devuelve los detalles de una clase específica.
 */
// GET /api/v1/clases/:id - Muestra una clase específica
async function verClase(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;
  const userRol = req.user.rol;

  try {
    const clase = await Clase.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "tutor",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Usuario,
          as: "estudiantes",
          attributes: ["id", "nombre", "email"],
        },
      ],
    });

    if (!clase) {
      const err = new Error("Clase no encontrada.");
      err.status = 404;
      return next(err);
    }

    if (userRol === "tutor") {
      // El tutor sólo puede ver sus propias clases
      if (clase.tutorId !== userId) {
        const err = new Error("No tienes permiso para ver esta clase.");
        err.status = 403;
        return next(err);
      }
    } else if (userRol === "estudiante") {
      // El estudiante sólo puede ver la clase a la que pertenece
      const usuario = await Usuario.findByPk(userId);
      if (usuario.claseId !== clase.id) {
        const err = new Error("No tienes permiso para ver esta clase.");
        err.status = 403;
        return next(err);
      }
    } else {
      // Roles inesperados
      const err = new Error("Rol no autorizado.");
      err.status = 403;
      return next(err);
    }

    return res.json({
      success: true,
      clase: {
        id: clase.id,
        nombre: clase.nombre,
        codigo: clase.codigo,
        numEstudiantes: clase.estudiantes.length,
        tutor: clase.tutor, // { id, nombre, email }
        estudiantes: clase.estudiantes, // [ { id, nombre, email }, ... ]
      },
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
  const { id } = req.params;
  const { nombre } = req.body;
  const tutorId = req.user.id;

  try {
    const clase = await Clase.findByPk(id);
    if (!clase) {
      const err = new Error("Clase no encontrada.");
      err.status = 404;
      return next(err);
    }
    if (req.user.rol !== "tutor" || clase.tutorId !== tutorId) {
      const err = new Error("No tienes permiso para modificar esta clase.");
      err.status = 403;
      return next(err);
    }

    if (nombre && nombre !== clase.nombre) {
      const duplicada = await Clase.findOne({
        where: {
          tutorId,
          nombre
        }
      });
      if (duplicada) {
        const err = new Error("Ya tienes otra clase con ese nombre.");
        err.status = 409;
        return next(err);
      }
      clase.nombre = nombre;
    }

    await clase.save();

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
  const tutorId = req.user.id;
  const { claseId, userId } = req.params;

  try {
    const clase = await Clase.findByPk(claseId);
    if (!clase) {
      const err = new Error("Clase no encontrada.");
      err.status = 404;
      return next(err);
    }
    if (clase.tutorId !== tutorId) {
      const err = new Error("No tienes permiso para modificar esta clase.");
      err.status = 403;
      return next(err);
    }

    const alumno = await Usuario.findByPk(userId);
    if (!alumno || alumno.claseId !== clase.id) {
      const err = new Error("El alumno no pertenece a esta clase.");
      err.status = 400;
      return next(err);
    }

    // Desasignar el claseId del alumno
    await Usuario.update({ claseId: null }, { where: { id: userId } });

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
  const { id } = req.params;
  const tutorId = req.user.id;

  try {
    const clase = await Clase.findByPk(id);
    if (!clase) {
      const err = new Error("Clase no encontrada.");
      err.status = 404;
      return next(err);
    }
    if (req.user.rol !== "tutor" || clase.tutorId !== tutorId) {
      const err = new Error("No tienes permiso para eliminar esta clase.");
      err.status = 403;
      return next(err);
    }

    await clase.destroy();

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
