// src/middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error(err);  // O envíalo a tu herramienta de logs
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;