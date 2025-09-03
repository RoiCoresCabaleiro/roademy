const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const authenticateToken = require('../middleware/authToken');
const ensureEstudiante = require('../middleware/ensureEstudiante');
const ensureTutor = require('../middleware/ensureTutor');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit');

const { validateRegister, validateLogin, validateEditarPerfil, validateUnirseClase } = require('../middleware/validators');


// Rutas públicas (no requieren token)
router.post('/register', registerLimiter, validateRegister, usuarioController.register);

router.post('/login', loginLimiter, validateLogin, usuarioController.login);


// Rutas protegidas (requieren token)
router.use(authenticateToken);

router.get('/me/dashboard', ensureEstudiante, usuarioController.dashboard);

router.get('/me/dashboard-tutor', ensureTutor, usuarioController.dashboardTutor);

router.get('/me', usuarioController.verPerfil);

router.put('/me', validateEditarPerfil, usuarioController.editarPerfil);

router.post('/me/unirse-clase', ensureEstudiante, validateUnirseClase, usuarioController.unirseClase);

router.delete('/me/clase', ensureEstudiante, usuarioController.abandonarClase);

router.delete('/me', usuarioController.eliminarCuenta);


module.exports = router;