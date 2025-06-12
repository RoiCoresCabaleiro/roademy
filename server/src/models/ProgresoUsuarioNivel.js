// server/src/models/ProgresoUsuarioNivel.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Progreso = sequelize.define(
  "ProgresoUsuarioNivel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nivelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    completado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estrellas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nota: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    intentos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    tableName: "progreso_usuario_nivel",
    indexes: [{ unique: true, fields: ["usuario_id", "nivel_id"] }],
  }
);

Progreso.associate = (models) => {
  Progreso.belongsTo(models.Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });
  Progreso.belongsTo(models.Nivel, {
    foreignKey: "nivelId",
    as: "nivel",
  });
  Progreso.hasMany(models.ProgresoRespuesta, {
    foreignKey: "progresoId",
    as: "respuestas",
    onDelete: "CASCADE",
  });
};

module.exports = Progreso;
