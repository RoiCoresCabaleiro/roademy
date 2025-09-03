const express = require("express");
const router = express.Router();

const minijuegoController = require("../controllers/minijuegoController");
const authenticateToken = require("../middleware/authToken");
const ensureEstudiante = require('../middleware/ensureEstudiante');
const ensureMinijuegoAccessible = require('../middleware/ensureMinijuegoAccessible');

const { validateCompleteMinijuego } = require('../middleware/validators');

// Todas las rutas requieren autenticación
router.use(authenticateToken, ensureEstudiante);

// GET /api/v1/minijuegos
router.get("/", minijuegoController.listarMinijuegos);

// POST /api/v1/minijuegos/:id/complete
router.post("/:id/complete", validateCompleteMinijuego, ensureMinijuegoAccessible, minijuegoController.completeMinijuego);

module.exports = router;
