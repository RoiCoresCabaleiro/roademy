// server/src/models/ProgresoUsuarioMinijuego.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ProgresoUsuarioMinijuego = sequelize.define(
  "ProgresoUsuarioMinijuego",
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
      validate: { min: 0 },
    },
  },
  {
    tableName: "progreso_usuario_minijuego",
    indexes: [{ unique: true, fields: ["usuario_id", "minijuego_id"] }],
  }
);

// Relaciones
ProgresoUsuarioMinijuego.associate = (models) => {
  ProgresoUsuarioMinijuego.belongsTo(models.Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });

  ProgresoUsuarioMinijuego.belongsTo(models.Minijuego, {
    foreignKey: "minijuegoId",
    as: "minijuego",
  });
};

module.exports = ProgresoUsuarioMinijuego;
