// server/src/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res) {
  const { nombre, email, contraseña } = req.body;
  if (!nombre || !email || !contraseña) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
  }

  try {
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(409).json({ success: false, message: 'Email ya registrado.' });
    }

    const hash = await bcrypt.hash(contraseña, 10);
    const nuevoUser = await Usuario.create({ nombre, email, contraseña: hash });
    res.status(201).json({
      success: true,
      user: { id: nuevoUser.id, nombre: nuevoUser.nombre, email: nuevoUser.email }
    });
  } catch (err) {
    console.error('Error en register:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
}

async function login(req, res) {
  const { identifier, contraseña } = req.body;
  if (!identifier || !contraseña) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
  }

  try {
    const user = await Usuario.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { nombre: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token, user: { id: user.id, nombre: user.nombre, email: user.email } });
    
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
}

module.exports = { register, login };
