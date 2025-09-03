const jwt = require("jsonwebtoken");
const { RefreshToken, Usuario } = require("../models");

/**
 * POST /api/v1/auth/refresh
 * Toma el refreshToken de la cookie y, si es válido y no está revocado,
 * genera un nuevo accessToken.
 */
async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      const err = new Error("Falta refresh token en cookie");
      err.status = 401;
      return next(err);
    }

    // Buscar el token en la BD
    const dbToken = await RefreshToken.findOne({ where: { token } });
    if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
      const err = new Error("Refresh token inválido o expirado");
      err.status = 401;
      return next(err);
    }

    // Generar un nuevo access token
    const user = await Usuario.findByPk(dbToken.usuarioId);
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol, claseId: user.claseId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/logout
 * Marca el refresh token como revocado y borra la cookie.
 * Requiere que el usuario esté autenticado (access token válido).
 */
async function logout(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await RefreshToken.update({ revoked: true }, { where: { token } });
    }
    // Borrar la cookie en el cliente
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { refresh, logout };
