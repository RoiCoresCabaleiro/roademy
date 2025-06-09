// server/src/routes/claseRoutes.js

const express = require('express');
const router = express.Router();
const claseController = require('../controllers/claseController');
const authenticateToken = require('../middleware/auth');

const { validateCrearClase, validateIdParam, validateEliminarEstudiante } = require('../middleware/validators');


router.use(authenticateToken);

// POST /api/v1/clases - Crea una nueva clase (solo para tutores)
router.post('/', validateCrearClase, claseController.crearClase);

// GET /api/v1/clases - Lista todas las clases del tutor autenticado
router.get('/', claseController.listarClases);

// GET /api/v1/clases/:id - Muestra una clase específica
router.get('/:id', validateIdParam, claseController.verClase);

// PUT /api/v1/clases/:id - Actualiza nombre de la clase
router.put('/:id', validateIdParam, validateCrearClase, claseController.actualizarClase);

// DELETE /api/v1/clases/:claseId/estudiantes/:userId
router.delete('/:claseId/estudiantes/:userId', validateEliminarEstudiante, claseController.eliminarEstudiante);

// DELETE /api/v1/clases/:id - Elimina una clase
router.delete('/:id', validateIdParam, claseController.eliminarClase);


module.exports = router;
