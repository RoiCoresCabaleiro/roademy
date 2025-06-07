// server/src/models/index.js

const Usuario = require('./Usuario');
const Clase   = require('./Clase');

// Asociación 1 Estudiante → 0..1 Clase
Usuario.belongsTo(Clase, {
  foreignKey: 'claseId',
  as: 'clase'
});
Clase.hasMany(Usuario, {
  foreignKey: 'claseId',
  as: 'estudiantes'
});


// Asociación 1 Tutor → 1..n Clases
Usuario.hasMany(Clase, {
  foreignKey: 'tutorId',
  as: 'clases',
  onDelete: 'CASCADE'  // Eliminar clases si se elimina el tutor
});
Clase.belongsTo(Usuario, {
  foreignKey: 'tutorId',
  as: 'tutor'
});

module.exports = { Usuario, Clase };