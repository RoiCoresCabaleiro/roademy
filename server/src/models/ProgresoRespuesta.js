// server/src/models/ProgresoRespuesta.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Respuesta = sequelize.define(
  "ProgresoRespuesta",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    progresoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    preguntaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seleccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    respondidoAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "progreso_respuesta",
    indexes: [{ unique: true, fields: ["progreso_id", "pregunta_id"] }],
  }
);

Respuesta.associate = (models) => {
  Respuesta.belongsTo(models.ProgresoUsuarioNivel, {
    foreignKey: "progresoId",
    as: "progreso",
  });
};

module.exports = Respuesta;
