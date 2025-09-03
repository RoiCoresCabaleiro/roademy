const express = require("express");
const router = express.Router();

const { refresh, logout } = require("../controllers/authController");
const authenticateToken = require("../middleware/authToken");

// POST /api/v1/auth/refresh - Renueva el access token usando el refresh token de la cookie
router.post("/refresh", refresh);

// POST /api/v1/auth/logout - Revoca el refresh token y borra la cookie
router.post("/logout", authenticateToken, logout);

module.exports = router;
