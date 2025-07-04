// server/src/controllers/usuarioController.js

const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { Clase, Usuario, RefreshToken } = require("../models");
const progresoService = require('../services/progresoService');
const activityLogService = require("../services/activityLogService");
const generateUniqueCode = require('../utils/generateUniqueCode');
const tokenService = require("../services/tokenService");

// POST /api/v1/register - Registra un nuevo usuario (Estudiante o Tutor)
async function register(req, res, next) {
  try {
    const { nombre, email, contraseña, rol, codigoClase } = req.body;

    if (
      await Usuario.findOne({
        where: { [Op.or]: [{ email }, { nombre }] },
      })
    ) {
      const err = new Error("Nombre de usuario o email ya registrados.");
      err.status = 409;
      return next(err);
    }

    // Validar clase si se ha proporcionado (estudiante)
    let clase = null;
    if (rol === "estudiante" && codigoClase) {
      clase = await Clase.findOne({ where: { codigo: codigoClase } });
      if (!clase) {
        const err = new Error("Código de clase inválido.");
        err.status = 400;
        return next(err);
      }
    }


    const nuevoUser = await Usuario.create({
      nombre,
      email,
      contraseña,
      rol,
      claseId: rol === "estudiante" && clase ? clase.id : null,
    });

    // Crear clase inicial (tutor)
    let initialClass = null;
    if (rol === "tutor") {
      const codigo = await generateUniqueCode(6);

      initialClass = await Clase.create({
        nombre: "Mi primera clase",
        codigo,
        tutorId: nuevoUser.id,
      });
    }

    // Generar y enviar tokens (access + refresh en cookie)
    const accessToken = await tokenService.generateTokensForUser(nuevoUser, res);

    // Construir la respuesta
    const response = {
      success: true,
      accessToken,
      user: {
        id: nuevoUser.id,
        nombre: nuevoUser.nombre,
        email: nuevoUser.email,
        rol: nuevoUser.rol,
        claseId: nuevoUser.claseId,
      },
    };
    if (initialClass) {
      response.initialClass = {
        id: initialClass.id,
        nombre: initialClass.nombre,
        codigo: initialClass.codigo,
      };
    }

    return res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/login - Inicia sesión
async function login(req, res, next) {
  try {
    const { identifier, contraseña } = req.body;
    
    const user = await Usuario.findOne({
      where: { [Op.or]: [{ email: identifier }, { nombre: identifier }] },
    });
    if (!user) {
      const err = new Error("Usuario no encontrado.");
      err.status = 404;
      return next(err);
    }

    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) {
      const err = new Error("Contraseña incorrecta.");
      err.status = 400;
      return next(err);
    }

    const accessToken = await tokenService.generateTokensForUser(user, res);
    return res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

/**
 * Devuelve la informacion para el dashboard del estudiante
 */
// GET  /api/v1/usuarios/dashboard
async function dashboard(req, res, next) {
  try {
    const userId = req.user.id;
    // 1) Contexto general
    const { nivelesEstado, temasEstado, nivelActual, estrellasPosiblesCurso } = await progresoService.getContext(userId);

    // 2) Determinar tema actual
    let temaEntry, nActual;
    if (nivelActual) {
      nActual = nivelesEstado.find((n) => n.nivelId === nivelActual);
      temaEntry = temasEstado.find((t) => t.temaId === nActual.temaId);
    } else {
      const desbloqueados = temasEstado.filter((t) => t.desbloqueado);
      temaEntry = desbloqueados[desbloqueados.length - 1];
    }

    // 3) Calcular progreso en tema actual
    const { temaId, titulo, estrellasObtenidas, estrellasNecesarias, estrellasPosibles, totalNiveles, completados } = temaEntry;
    const porcentaje = estrellasPosibles ? Math.round((estrellasObtenidas / estrellasPosibles) * 100) : 0;

    // 4) Calcular progreso total del curso
    const estrellasObtenidasCurso = nivelesEstado.reduce((sum, n) => sum + n.estrellas,0);
    const porcentajeProgresoTotal = estrellasPosiblesCurso ? Math.round((estrellasObtenidasCurso / estrellasPosiblesCurso) * 100) : 0;

    // 5) Actividad reciente
    const limitLogs = parseInt(req.query.limitLogs, 10);
    const actividadReciente = await activityLogService.getActivityLog({
      usuarioIds: [userId],
      types: ["nivel", "tema"],
      invertOrder: false,
      limit: Number.isNaN(limitLogs) ? 5 : limitLogs,
    });

    return res.json({
      success: true,
      progresoTotalCurso: {
        estrellasObtenidasCurso,
        estrellasPosiblesCurso, // Total de estrellas del curso
        porcentajeProgresoTotal,
      },
      progresoTemaActual: {
        temaId,
        titulo,
        nivelActual: nActual ? nActual.nivelId : null,
        totalNiveles,
        completados,
        estrellasObtenidas,
        estrellasNecesarias,
        estrellasPosibles, // Total de estrellas del tema
        porcentaje,
      },
      actividadReciente,
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Devuelve la informacion para el dashboard del tutor
 */
// GET  /api/v1/usuarios/dashboard-tutor
async function dashboardTutor(req, res, next) {
  try {
    const clases  = await progresoService.getEstrellasClase(req.user.id);
    const { estrellasPosiblesCurso } = await progresoService.getTotalCourseStars();

    return res.json({
      success: true,
      clases: clases.map(c => ({
        id:               c.claseId,
        nombre:           c.nombre,
        numEstudiantes:   c.numEstudiantes,
        totalEstrellas:   c.totalEstrellas,
        mediaProgresoTotal: c.numEstudiantes > 0 ? Math.round(((c.totalEstrellas / c.numEstudiantes) / estrellasPosiblesCurso) * 100) : 0,
      }))
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Devuelve los datos del perfil (id, nombre, email, rol, claseId y, si tiene, la clase).
 */
// GET  /api/v1/usuarios/me
async function verPerfil(req, res, next) {
  try {
    const user = await Usuario.findByPk(req.user.id, {
      attributes: ["id", "nombre", "email", "rol"],
      include: [
        {
          model: Clase,
          as: "clase",
          attributes: ["id", "nombre", "codigo"],
          include: [
            {
              model: Usuario,
              as: "tutor",
              attributes: ["id", "nombre", "email"],
            },
          ],
        },
      ],
    });
    if (!user) {
      const err = new Error("Usuario no encontrado.");
      err.status = 404;
      return next(err);
    }
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

/**
 * Permite editar nombre, email y/o contraseña (con confirmación de la antigua).
 */
// PUT /api/v1/usuarios/me
async function editarPerfil(req, res, next) {
  try {
  const { nombre, email, contraseña, antiguaContraseña } = req.body;
  const updates = {};

    if (!nombre && !email && !contraseña) {
      const err = new Error("Debe proporcionar al menos un campo para actualizar.");
      err.status = 400;
      return next(err);
    }  

    // 1. Si quiere cambiar contraseña, validamos la antigua
    if (contraseña) {
      const usuario = await Usuario.findByPk(req.user.id);
      const match = await bcrypt.compare(antiguaContraseña, usuario.contraseña);
      if (!match) {
        const err = new Error("La contraseña actual no es correcta.");
        err.status = 400;
        return next(err);
      }
      updates.contraseña = contraseña;
    }

    // 2. Validar duplicados de nombre y email
    if (nombre) {
      const existente = await Usuario.findOne({
        where: {
          nombre,
          id: { [Op.ne]: req.user.id }, // distinto al actual
        },
      });
      if (existente) {
        const err = new Error("El nombre ya está en uso por otro usuario.");
        err.status = 409;
        return next(err);
      }
      updates.nombre = nombre;
    }
    if (email) {
      const existente = await Usuario.findOne({
        where: {
          email,
          id: { [Op.ne]: req.user.id },
        },
      });
      if (existente) {
        const err = new Error("El email ya está registrado.");
        err.status = 409;
        return next(err);
      }
      updates.email = email;
    }

    // 3. Aplicar cambios y devolver el usuario actualizado
    await Usuario.update(updates, { where: { id: req.user.id }, individualHooks: true });
    const usuarioActualizado = await Usuario.findByPk(req.user.id, {
      attributes: ["id", "nombre", "email", "rol", "claseId"],
    });

    const { id, nombre: n, email: e, rol, claseId } = usuarioActualizado;
    return res.json({
      success: true,
      user: { id, nombre: n, email: e, rol, claseId },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Permite a un estudiante unirse a una clase por código.
 * - Asigna claseId para el usuario autenticado.
 */
// POST /api/v1/usuarios/me/unirse-clase
async function unirseClase(req, res, next) {
  try {
    const { codigoClase } = req.body;
    const userId = req.user.id;

    if (req.user.rol !== "estudiante") {
      const err = new Error("Solo los estudiantes pueden unirse a una clase.");
      err.status = 403;
      return next(err);
    }

    const usuario = await Usuario.findByPk(userId);

    const clase = await Clase.findOne({ where: { codigo: codigoClase } });
    if (!clase) {
      const err = new Error("Código de clase inválido.");
      err.status = 400;
      return next(err);
    }

    if (usuario.claseId == clase.id) {
      const err = new Error("Ya perteneces a esta clase.");
      err.status = 400;
      return next(err);
    }

    if (usuario.claseId && usuario.claseId !== clase.id) {
      const err = new Error("Ya perteneces a otra clase. Primero debes abandonarla para unirte a otra.");
      err.status = 400;
      return next(err);
    }

    // Asignar claseId al usuario
    await Usuario.update({ claseId: clase.id }, { where: { id: userId } });

    return res.json({
      success: true,
      message: `Te has unido correctamente a la clase “${clase.nombre}”.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Permite a un estudiante abandonar su clase.
 * - Pone claseId = null para el usuario autenticado.
 */
// DELETE /api/v1/usuarios/me/clase
async function abandonarClase(req, res, next) {
  try {
    const userId = req.user.id;

    const usuario = await Usuario.findByPk(userId);
    if (!usuario.claseId) {
      const err = new Error("No perteneces a ninguna clase.");
      err.status = 400;
      return next(err);
    }

    // Desasignar claseId del usuario
    await Usuario.update({ claseId: null }, { where: { id: userId } });

    return res.json({
      success: true,
      message: "Has abandonado la clase correctamente.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * El usuario autenticado se da de baja (se elimina su registro).
 */
async function eliminarCuenta(req, res, next) {
  try {
    const userId = req.user.id;
    const { contraseña } = req.body;

    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      const err = new Error("Usuario no encontrado");
      err.status = 404;
      return next(err);
    }

    const match = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!match) {
      const err = new Error("Contraseña incorrecta");
      err.status = 400;
      return next(err);
    }

    const token = req.cookies.refreshToken;
    if (token) {
      await RefreshToken.update({ revoked: true }, { where: { token } });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Borrado definitivo
    await Usuario.destroy({ where: { id: userId } });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  dashboard,
  dashboardTutor,
  verPerfil,
  editarPerfil,
  unirseClase,
  abandonarClase,
  eliminarCuenta,
};
