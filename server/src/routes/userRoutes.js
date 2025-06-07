// server/src/routes/userRoutes.js
const express = require('express');
const { register, login } = require('../controllers/userController');

const router = express.Router();

// POST /api/register
router.post('/register', register);

// POST /api/login
router.post('/login', login);

module.exports = router;
