// server/src/models/Nivel.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Nivel = sequelize.define(
  "Nivel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    temaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "temas", key: "id" },
      validate: { isInt: true },
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    tipo: {
      type: DataTypes.ENUM("leccion", "quiz"),
      allowNull: false,
    },
    puntuacionMinima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 100 },
    },
  },
  {
    tableName: "niveles",
    indexes: [{ unique: "tema_orden_idx", fields: ["tema_id", "orden"] }],
  }
);

Nivel.associate = (models) => {
  Nivel.belongsTo(models.Tema, {
    foreignKey: "temaId",
    as: "tema",
  });
  Nivel.hasMany(models.ProgresoUsuarioNivel, {
    foreignKey: "nivelId",
    as: "progresos",
    onDelete: "CASCADE",
  });
  Nivel.hasMany(models.PreguntaSolucion, {
    foreignKey: "nivelId",
    as: "soluciones",
    onDelete: "CASCADE",
  });
  Nivel.hasMany(models.ActivityLogNivel, {
    foreignKey: "nivelId",
    as: "nivelLogs",
    onDelete: "CASCADE",
  });
};

module.exports = Nivel;
