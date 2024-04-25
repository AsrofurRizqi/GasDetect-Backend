const AuthRoutes = require('express').Router();
const authController = require('../controllers/AuthController');

AuthRoutes.post('/register', authController.signup);
AuthRoutes.post('/login', authController.signin);

module.exports = AuthRoutes;