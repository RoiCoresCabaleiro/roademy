// server/src/routes/claseRoutes.js

const express = require('express');
const router = express.Router();

const claseController = require('../controllers/claseController');
const authenticateToken = require('../middleware/auth');
const ensureTutor = require('../middleware/ensureTutor');
const ensureClaseAccessible = require('../middleware/ensureClaseAccessible');

const { validateCrearClase, validateIdParam, validateEliminarEstudiante } = require('../middleware/validators');


// Todas estas rutas requieren token
router.use(authenticateToken);

router.post('/', ensureTutor, validateCrearClase, claseController.crearClase);

router.get('/', ensureTutor, claseController.listarClases);

router.get('/:id', validateIdParam, ensureClaseAccessible, claseController.verClase);


// Solo tutores propietarios de la clase pueden acceder a los endpoints siguientes
router.use('/:id', validateIdParam, ensureTutor, ensureClaseAccessible);

router.put('/:id', validateCrearClase, claseController.actualizarClase);

router.delete('/:claseId/estudiantes/:userId', validateEliminarEstudiante, claseController.eliminarEstudiante);

router.delete('/:id', claseController.eliminarClase);


module.exports = router;
