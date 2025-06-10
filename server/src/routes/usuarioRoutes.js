// server/src/routes/usuarioRoutes.js

const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const authenticateToken = require('../middleware/auth');
const ensureEstudiante   = require('../middleware/ensureEstudiante');

const { validateRegister, validateLogin, validateEditarPerfil, validateUnirseClase } = require('../middleware/validators');


// Rutas públicas (no requieren token)
router.post('/register', validateRegister, usuarioController.register);

router.post('/login', validateLogin, usuarioController.login);


// Rutas protegidas (requieren token)
router.use(authenticateToken);

router.get('/me/dashboard', ensureEstudiante, usuarioController.dashboard);

router.get('/me', usuarioController.verPerfil);

router.put('/me', validateEditarPerfil, usuarioController.editarPerfil);

router.post('/me/unirse-clase', validateUnirseClase, usuarioController.unirseClase);

router.delete('/me/clase', ensureEstudiante, usuarioController.abandonarClase);

router.delete('/me', usuarioController.eliminarCuenta);


module.exports = router;