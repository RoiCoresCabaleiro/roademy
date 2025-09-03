const express = require('express');
const router = express.Router();

const progresoController = require('../controllers/progresoController');
const authenticateToken = require('../middleware/authToken');
const ensureEstudiante = require('../middleware/ensureEstudiante');
const ensureNivelAccessible = require('../middleware/ensureNivelAccessible');

const { validateNivelId, validateAnswer } = require('../middleware/validators');


// Todas estas rutas requieren token y que el usuario sea estudiante
router.use(authenticateToken, ensureEstudiante);

router.get('/usuario/roadmap', progresoController.getRoadmap);

router.get('/:nivelId/init', validateNivelId, ensureNivelAccessible, progresoController.iniciarNivel);

router.post('/:nivelId/answer', validateNivelId, validateAnswer, ensureNivelAccessible, progresoController.answerPregunta);

router.post('/:nivelId/complete', validateNivelId, ensureNivelAccessible, progresoController.completeNivel);


module.exports = router;
