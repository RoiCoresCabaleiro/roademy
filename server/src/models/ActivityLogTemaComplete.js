// server/src/models/ActivityLogTemaComplete.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ActivityLogTemaComplete = sequelize.define(
  "ActivityLogTemaComplete",
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
    temaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "activity_log_tema_complete",
    timestamps: true,
    updatedAt: false, // sólo createdAt
    indexes: [
      { fields: ["usuario_id", "created_at"] },
      { unique: true, fields: ["usuario_id", "tema_id"] },
    ],
  }
);

ActivityLogTemaComplete.associate = (models) => {
  ActivityLogTemaComplete.belongsTo(models.Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });
  ActivityLogTemaComplete.belongsTo(models.Tema, {
    foreignKey: "temaId",
    as: "tema",
  });
};

module.exports = ActivityLogTemaComplete;
