// server/src/app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require('cookie-parser');
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middleware/errorHandler");

const authRoutes   = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const claseRoutes = require("./routes/claseRoutes");
const progresoRoutes = require('./routes/progresoRoutes');


const app = express();

// Seguridad y parsing
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
// const corsOptions = {
//   origin: [process.env.FRONTEND_URL]
//   methods: ["GET","POST","PUT","DELETE"],
//   credentials: true,
// };
app.use(cors());  // app.use(cors(corsOptions));


// Rutas de la API
app.use("/api/v1/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/usuarios", usuarioRoutes);
app.use("/api/v1/clases", claseRoutes);
app.use('/api/v1/progresos', progresoRoutes);

// Ruta pública de prueba
app.get("/", (req, res) => {
  res.json({ success: true, message: "API up and running" });
});

// Captura centralizada de errores
app.use(errorHandler);

module.exports = app;
