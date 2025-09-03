const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const PreguntaSolucion = sequelize.define(
  "PreguntaSolucion",
  {
    preguntaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nivelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "niveles", key: "id" },
    },
    respuestaCorrecta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "pregunta_soluciones",
  }
);

// Relaciones
PreguntaSolucion.associate = (models) => {
  // Cada solución pertenece a un nivel
  PreguntaSolucion.belongsTo(models.Nivel, {
    foreignKey: "nivelId",
    as: "nivel",
  });
  PreguntaSolucion.hasMany(models.ProgresoRespuesta, {
    foreignKey: "preguntaId",
    as: "respuestas",
    onDelete: "CASCADE",
  });
};

module.exports = PreguntaSolucion;
