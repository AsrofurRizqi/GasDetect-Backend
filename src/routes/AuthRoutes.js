const AuthRoutes = require('express').Router();
const authController = require('../controllers/AuthController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

// auth routes
AuthRoutes.get('/token-check', AuthMiddleware.checkToken, authController.tokenCheck);
AuthRoutes.get('/device-check', AuthMiddleware.checkDevice, authController.checkUserFromUrlkeyDevice);
AuthRoutes.get('/page-change-password/:token', authController.pageChangePassword);
AuthRoutes.get('/verify/:token', authController.verify);
AuthRoutes.post('/register', authController.signup);
AuthRoutes.post('/login', authController.signin);
AuthRoutes.post('/forgot-password', authController.forgotPassword);
AuthRoutes.post('/reset-password/:token', authController.resetPassword);
AuthRoutes.post('/user-change-password', AuthMiddleware.checkToken, authController.userChangePassword);

// admin routes

module.exports = AuthRoutes;