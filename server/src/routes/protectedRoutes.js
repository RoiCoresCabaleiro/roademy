// server/src/routes/protectedRoutes.js
const express = require('express');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Ruta protegida: GET /api/protected
router.get('/protected', authenticateToken, (req, res) => {
  // Aquí req.user está disponible tras verificar el token
  res.json({ message: `Hola usuario con ID ${req.user.id}` });
});

module.exports = router;
