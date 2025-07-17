// server/src/models/RefreshToken.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "usuarios", key: "id" },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "refresh_tokens",
    indexes: [{ fields: ["expires_at"] }]
  }
);

// Relaciones
RefreshToken.associate = (models) => {
  RefreshToken.belongsTo(models.Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });
};

module.exports = RefreshToken;
