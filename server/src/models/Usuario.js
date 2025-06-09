// server/src/models/Usuario.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nombre: {
      type: DataTypes.STRING(30), // hasta 30 caracteres
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Por favor, introduzca un nombre de usuario." },
        len: {
          args: [3, 30],
          msg: "El nombre de usuario debe tener entre 3 y 30 caracteres.",
        },
        isAlphanumeric: { msg: "Solo letras y números." },
      },
    },

    email: {
      type: DataTypes.STRING(60), // hasta 60 caracteres
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Por favor, introduzca un email." },
        isEmail: { msg: "Por favor, introduzca un email válido." },
        len: {
          args: [5, 60],
          msg: "El email debe tener entre 5 y 60 caracteres.",
        },
      },
    },

    contraseña: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Por favor, introduzca una contraseña." },
      },
    },

    rol: {
      type: DataTypes.ENUM("estudiante", "tutor"),
      allowNull: false,
      defaultValue: "estudiante",
    },

    claseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "clases",
        key: "id",
      },
      validate: {
        isInt: { msg: "El ID de la clase debe ser un número." },
      },
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
    underscored: false, // camelCase
  }
);

Usuario.associate = (models) => {
  // Un estudiante puede pertenecer a cero o una clase
  Usuario.belongsTo(models.Clase, {
    foreignKey: "claseId",
    as: "clase",
  });
  // Un tutor administra muchas clases
  Usuario.hasMany(models.Clase, {
    foreignKey: "tutorId",
    as: "clases",
    onDelete: "CASCADE", // Si el tutor se elimina, sus clases también
  });

  // Navegar de usuario a sus refresh tokens:
  // Usuario.hasMany(models.RefreshToken, { foreignKey: 'usuarioId', as: 'refreshTokens' })
};

module.exports = Usuario;
