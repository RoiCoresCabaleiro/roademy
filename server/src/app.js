// server/src/app.js

//require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cookieParser = require('cookie-parser');
const cors = require("cors");

const errorHandler = require("./middleware/errorHandler");

const authRoutes   = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const claseRoutes = require("./routes/claseRoutes");
const progresoRoutes = require('./routes/progresoRoutes');
const minijuegoRoutes = require("./routes/minijuegoRoutes");

//const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();

// Seguridad y parsing
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Rutas de la API
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/usuarios", usuarioRoutes);
app.use("/api/v1/clases", claseRoutes);
app.use('/api/v1/progresos', progresoRoutes);
app.use("/api/v1/minijuegos", minijuegoRoutes);

// Captura centralizada de errores
app.use(errorHandler);

module.exports = app;
