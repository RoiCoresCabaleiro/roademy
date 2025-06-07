// server/src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegister, validateLogin } = require('../middleware/validators');

// POST /api/v1/register
router.post('/register', validateRegister, userController.register);

// POST /api/v1/login
router.post('/login', validateLogin, userController.login);

module.exports = router;