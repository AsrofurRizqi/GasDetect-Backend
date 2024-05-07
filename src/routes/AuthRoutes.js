const AuthRoutes = require('express').Router();
const authController = require('../controllers/AuthController');

// auth routes
AuthRoutes.post('/register', authController.signup);
AuthRoutes.post('/login', authController.signin);

// admin routes

module.exports = AuthRoutes;