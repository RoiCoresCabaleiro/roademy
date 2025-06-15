// server/src/models/index.js

const sequelize = require("../config/sequelize");
const RefreshToken = require("./RefreshToken");
const Usuario = require("./Usuario");
const Clase = require("./Clase");
const Tema = require("./Tema");
const Nivel = require("./Nivel");
const PreguntaSolucion = require("./PreguntaSolucion");
const ProgresoUsuarioNivel = require("./ProgresoUsuarioNivel");
const ProgresoRespuesta = require("./ProgresoRespuesta");
const ActivityLogNivel = require("./ActivityLogNivel");
const ActivityLogTemaComplete = require("./ActivityLogTemaComplete");

const db = {
  sequelize,
  RefreshToken,
  Usuario,
  Clase,
  Tema,
  Nivel,
  PreguntaSolucion,
  ProgresoUsuarioNivel,
  ProgresoRespuesta,
  ActivityLogNivel,
  ActivityLogTemaComplete,
};

RefreshToken.associate(db);
Usuario.associate(db);
Clase.associate(db);
Tema.associate(db);
Nivel.associate(db);
PreguntaSolucion.associate(db);
ProgresoUsuarioNivel.associate(db);
ProgresoRespuesta.associate(db);
ActivityLogNivel.associate(db);
ActivityLogTemaComplete.associate(db);

module.exports = db;
