// server/src/models/Usuario.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const bcrypt = require("bcryptjs");

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
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.contraseña) {
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, 10);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed("contraseña")) {
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, 10);
        }
      },
    },
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
  Usuario.hasMany(models.ProgresoUsuarioNivel, {
    foreignKey: "usuarioId",
    as: "progresos",
    onDelete: "CASCADE",
  });
  Usuario.hasMany(models.RefreshToken, {
    foreignKey: "usuarioId",
    as: "refreshTokens",
    onDelete: "CASCADE",
  });
  Usuario.hasMany(models.ActivityLogNivel, {
    foreignKey: "usuarioId",
    as: "nivelLogs",
    onDelete: "CASCADE",
  });
  Usuario.hasMany(models.ActivityLogTemaComplete, {
    foreignKey: "usuarioId",
    as: "temaLogs",
    onDelete: "CASCADE",
  });
  Usuario.hasMany(models.ActivityLogMinijuego, {
    foreignKey: "usuarioId",
    as: "minijuegoLogs",
    onDelete: "CASCADE",
  });
  Usuario.hasMany(models.ProgresoUsuarioMinijuego, {
    foreignKey: "usuarioId",
    as: "progresoMinijuegos",
    onDelete: "CASCADE",
  });
};

module.exports = Usuario;
