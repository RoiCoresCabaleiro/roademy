// server/src/services/tokenService.js

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { RefreshToken } = require("../models");
const path = require("path");
const { NONAME } = require("dns");

/**
 * Genera y envía al cliente accessToken + refreshToken.
 */
async function generateTokensForUser(user, res) {
  // 0) Revocar todos los refreshTokens previos del usuario
  await RefreshToken.update(
    { revoked: true },
    { where: { usuarioId: user.id, revoked: false } }
  );

  // 1) Access Token (15 minutos)
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol, claseId: user.claseId },
    process.env.JWT_SECRET,
    { expiresIn: "1m" }
  );

  // 2) Refresh Token (aleatorio) + expiración (7 días)
  const refreshToken = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 3) Guardar refreshToken en BD
  await RefreshToken.create({
    token: refreshToken,
    usuarioId: user.id,
    expiresAt,
    revoked: false,
  });

  // 4) Mandar la cookie HTTP-only
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none", 
    expires: expiresAt,
    path: "/",
  });

  // 5) Devolver sólo el accessToken para el body JSON
  return accessToken;
}

module.exports = { generateTokensForUser };
