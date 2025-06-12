// server/src/models/Clase.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Clase = sequelize.define(
  "Clase",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Por favor, introduzca un nombre para la clase.",
        },
        len: {
          args: [3, 50],
          msg: "El nombre de la clase debe tener entre 3 y 50 caracteres.",
        },
      },
    },

    codigo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          args: true,
          msg: "Por favor, introduzca un código para la clase.",
        },
        isAlphanumeric: {
          args: true,
          msg: "El código de la clase solo puede contener letras y números.",
        },
        len: {
          args: [6, 6],
          msg: "El código de la clase debe tener exactamente 6 caracteres.",
        },
      },
    },

    tutorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
      validate: {
        isInt: {
          args: true,
          msg: "TutorId debe ser un número entero válido.",
        },
        notEmpty: {
          args: true,
          msg: "Por favor, especifique el tutor de la clase.",
        },
      },
    },
  },
  {
    tableName: "clases",
  }
);

Clase.associate = (models) => {
  // Una clase agrupa muchos estudiantes
  Clase.hasMany(models.Usuario, {
    foreignKey: "claseId",
    as: "estudiantes",
    onDelete: "SET NULL",
  });
  // Una clase pertenece a un tutor
  Clase.belongsTo(models.Usuario, {
    foreignKey: "tutorId",
    as: "tutor",
  });
};

module.exports = Clase;
