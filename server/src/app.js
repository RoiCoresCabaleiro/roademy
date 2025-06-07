// server/src/app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const usuarioRoutes = require("./routes/usuarioRoutes");
const claseRoutes = require("./routes/claseRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Seguridad y parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Limitador de peticiones
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Rutas de la API
app.use("/api/v1/usuarios", usuarioRoutes);
app.use("/api/v1/clases", claseRoutes);

// Ruta pública de prueba
app.get("/", (req, res) => {
  res.json({ success: true, message: "API up and running" });
});

// Captura centralizada de errores
app.use(errorHandler);

module.exports = app;
