// server/src/middleware/auth.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  // El token suele enviarse en la cabecera Authorization: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido.' });
  }

  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
    // Opcional: guardar datos del usuario en req.user
    req.user = { id: payload.id, email: payload.email };
    next();
  });
}

module.exports = authenticateToken;
