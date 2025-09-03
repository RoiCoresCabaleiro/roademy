const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Respuesta = sequelize.define(
  "ProgresoRespuesta",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    progresoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "progreso_usuario_nivel", key: "id" },
    },
    preguntaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "pregunta_soluciones", key: "pregunta_id" },
    },
    seleccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    respondidoAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "progreso_respuesta",
    
  }
);

// Relaciones
Respuesta.associate = (models) => {
  Respuesta.belongsTo(models.ProgresoUsuarioNivel, {
    foreignKey: "progresoId",
    as: "progreso",
  });
  Respuesta.belongsTo(models.PreguntaSolucion, {
    foreignKey: "preguntaId",
    as: "pregunta",
  });
};

module.exports = Respuesta;
