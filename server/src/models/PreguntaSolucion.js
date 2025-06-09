// server/src/models/PreguntaSolucion.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const PreguntaSolucion = sequelize.define(
  "PreguntaSolucion",
  {
    preguntaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    respuestaCorrecta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "pregunta_soluciones",
    timestamps: true,
  }
);

module.exports = PreguntaSolucion;
