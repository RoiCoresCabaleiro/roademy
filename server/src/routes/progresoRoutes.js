// server/src/routes/progresoRoutes.js

const express = require('express');
const router = express.Router();
const progresoController = require('../controllers/progresoController');
const authenticateToken = require('../middleware/auth');
const ensureStudent = require('../middleware/ensureStudent');
const ensureNivelAccessible = require('../middleware/ensureNivelAccessible');

const { validateNivelId, validateAnswer } = require('../middleware/validators/progresoValidators');


// Todas estas rutas requieren token y que el usuario sea estudiante
router.use(authenticateToken, ensureStudent);

/**
 * GET /api/v1/progresos/usuario/roadmap
 * ──────────────────────────────────────────
 * Devuelve el estado de **todos** los niveles y un resumen por tema.
 */
router.get('/usuario/roadmap', progresoController.getRoadmap);

/**
 * GET  /api/v1/progresos/:nivelId
 * ────────────────────────────────
 * Recupera o inicializa el progreso del usuario en ese nivel,
 * junto con todas las respuestas parciales guardadas.
 */
router.get('/:nivelId', validateNivelId, ensureNivelAccessible, progresoController.getProgresoNivel);

/**
 * POST /api/v1/progresos/:nivelId/answer
 * ───────────────────────────────────────
 * Valida e inserta/actualiza una única respuesta a una pregunta.
 */
router.post('/:nivelId/answer', validateNivelId, validateAnswer, ensureNivelAccessible, progresoController.answerPregunta);

/**
 * POST /api/v1/progresos/:nivelId/complete
 * ─────────────────────────────────────────
 * Marca un intento como completado, calcula estrellas/nota,
 * borra respuestas parciales y actualiza intentos.
 */
router.post('/:nivelId/complete', validateNivelId, ensureNivelAccessible, progresoController.completeNivel);


module.exports = router;
