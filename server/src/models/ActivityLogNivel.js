// server/src/models/ActivityLogNivel.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ActivityLogNivel = sequelize.define(
  "ActivityLogNivel",
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
      allowNull: false,
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    intento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "activity_log_nivel",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["usuario_id", "created_at"] },
      { fields: ["nivel_id"] },
    ],
  }
);

ActivityLogNivel.associate = (models) => {
  ActivityLogNivel.belongsTo(models.Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });
  ActivityLogNivel.belongsTo(models.Nivel, {
    foreignKey: "nivelId",
    as: "nivel",
  });
};

module.exports = ActivityLogNivel;
