// server/src/models/Minijuego.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Minijuego = sequelize.define(
  "Minijuego",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 60],
      },
    },
    nivelDesbloqueo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "niveles",
        key: "id",
      },
    },
  },
  {
    tableName: "minijuegos",
    timestamps: false,
  }
);

// Relaciones
Minijuego.associate = (models) => {
  Minijuego.belongsTo(models.Nivel, {
    foreignKey: "nivelDesbloqueo",
    as: "nivel",
  });

  Minijuego.hasMany(models.ProgresoUsuarioMinijuego, {
    foreignKey: "minijuegoId",
    as: "progresos",
    onDelete: "CASCADE",
  });
};

module.exports = Minijuego;
