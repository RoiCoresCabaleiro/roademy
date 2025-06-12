// server/src/models/Tema.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Tema = sequelize.define(
  "Tema",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [3, 100], notEmpty: true },
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: { min: 1 },
    },
    estrellasNecesarias: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    tableName: "temas",
  }
);

Tema.associate = (models) => {
  Tema.hasMany(models.Nivel, {
    foreignKey: "temaId",
    as: "niveles",
    onDelete: "RESTRICT",
  });
};

module.exports = Tema;
