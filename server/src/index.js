// server/src/index.js

require('dotenv').config();
const { sequelize } = require('./models');
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();