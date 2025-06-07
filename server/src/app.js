// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRouter = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Limitador de peticiones
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Rutas
app.use('/api/v1', apiRouter);

// Ruta pública de prueba
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API up and running' });
});

// Middleware de captura de errores
app.use(errorHandler);

module.exports = app;