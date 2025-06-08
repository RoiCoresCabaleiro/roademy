// server/src/routes/usuarioRoutes.js

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authenticateToken = require('../middleware/auth');

const { validateRegister, validateLogin, validateEditarPerfil, validateUnirseClase, validateAbandonarClase } = require('../middleware/validators');


// Rutas públicas
router.post('/register', validateRegister, usuarioController.register);

router.post('/login', validateLogin, usuarioController.login);


router.use(authenticateToken);

// Rutas protegidas
router.get('/me', usuarioController.verPerfil);

router.put('/me', validateEditarPerfil, usuarioController.editarPerfil);

router.post('/me/unirse-clase', validateUnirseClase, usuarioController.unirseClase);

router.delete('/me/clase', validateAbandonarClase, usuarioController.abandonarClase);

router.delete('/me', authenticateToken, usuarioController.eliminarCuenta);


module.exports = router;