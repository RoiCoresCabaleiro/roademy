// server/src/controllers/userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/v1/register
async function register(req, res, next) {
  const { nombre, email, contraseña } = req.body;

  try {
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      const err = new Error('Email ya registrado.');
      err.status = 409;
      return next(err);
    }

    const hash = await bcrypt.hash(contraseña, 10);
    const nuevoUser = await Usuario.create({ nombre, email, contraseña: hash });

    return res.status(201).json({ success: true, user: { id: nuevoUser.id, nombre: nuevoUser.nombre, email: nuevoUser.email } });

  } catch (err) {
    next(err);
  }
}

// POST /api/v1/login
async function login(req, res, next) {
  const { identifier, contraseña } = req.body;

  try {
    const user = await Usuario.findOne({
      where: { [Op.or]: [ { email: identifier }, { nombre: identifier } ] }
    });

    if (!user) {
      const err = new Error('Usuario no encontrado.');
      err.status = 404;
      return next(err);
    }

    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) {
      const err = new Error('Contraseña incorrecta.');
      err.status = 401;
      return next(err);
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ success: true, token, user: { id: user.id, nombre: user.nombre, email: user.email } });

  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };