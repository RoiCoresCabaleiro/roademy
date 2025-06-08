// server/src/models/index.js

const sequelize = require('../config/sequelize');
const Usuario = require('./Usuario');
const Clase   = require('./Clase');
const RefreshToken = require('./RefreshToken');

const db = { sequelize, Usuario, Clase, RefreshToken };

// Asociación 1 Estudiante → 0..1 Clase
Usuario.belongsTo(Clase, { foreignKey: 'claseId', as: 'clase' });
Clase.hasMany(Usuario,  { foreignKey: 'claseId', as: 'estudiantes' });

// Asociación 1 Tutor → 1..n Clases
Usuario.hasMany(Clase,  { foreignKey: 'tutorId', as: 'clases', onDelete: 'CASCADE' });  // Si el tutor se elimina, sus clases también
Clase.belongsTo(Usuario,{ foreignKey: 'tutorId', as: 'tutor' });

RefreshToken.associate(db);

module.exports = db;