// server/src/index.js
require('dotenv').config();
const express = require('express');
const sequelize = require('./config/sequelize');
const userRoutes = require('./routes/userRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando dentro de Docker.' });
});

// Rutas de registro/login sin protección
app.use('/api', userRoutes);
// Rutas protegidas requieren token
app.use('/api', protectedRoutes);

// Arrancar servidor y sincronizar BD
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL exitosa.');

    // Sincronizar todos los modelos (en desarrollo)
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la BD.');

    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

startServer();
