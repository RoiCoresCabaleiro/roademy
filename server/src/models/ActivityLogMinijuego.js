// server/src/models/ActivityLogMinijuego.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ActivityLogMinijuego = sequelize.define(
  "ActivityLogMinijuego",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "usuarios", key: "id" },
    },
    minijuegoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "minijuegos", key: "id" },
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "activity_log_minijuego",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["usuario_id", "created_at"] },
      { fields: ["minijuego_id"] },
    ],
  }
);

// Relaciones
ActivityLogMinijuego.associate = (models) => {
  ActivityLogMinijuego.belongsTo(models.Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });
  ActivityLogMinijuego.belongsTo(models.Minijuego, {
    foreignKey: "minijuegoId",
    as: "minijuego",
  });
};

module.exports = ActivityLogMinijuego;
