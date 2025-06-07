// server/src/models/Usuario.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  nombre: {
    type: DataTypes.STRING(30),   // hasta 30 caracteres
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Por favor, introduzca un nombre de usuario.' },
      len: {
        args: [3, 30],
        msg: 'El nombre de usuario debe tener entre 3 y 30 caracteres.'
      },
      isAlphanumeric: { msg: 'Solo letras y números.' }
    }
  },

  email: {
    type: DataTypes.STRING(60),  // hasta 60 caracteres
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Por favor, introduzca un email.' },
      isEmail:  { msg: 'Por favor, introduzca un email válido.' },
      len: {
        args: [5, 60],
        msg: 'El email debe tener entre 5 y 60 caracteres.'
      }
    }
  },

  contraseña: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Por favor, introduzca una contraseña.' },
    }
  },

  rol: {
    type: DataTypes.ENUM('estudiante', 'tutor'),
    allowNull: false,
    defaultValue: 'estudiante'
  },

  codigoClase: {
    type: DataTypes.STRING,
    allowNull: true
  }

}, {
  tableName: 'usuarios',
  timestamps: true,
  underscored: false    // camelCase
});

module.exports = Usuario;