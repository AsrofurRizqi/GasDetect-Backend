const UserRoutes = require('express').Router();
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

// user routes
UserRoutes.get('/users/:id', AuthMiddleware.checkToken, AuthMiddleware.checkUser, UserController.getUserProfile);
UserRoutes.put('/users/:id', AuthMiddleware.checkToken, AuthMiddleware.checkUser, UserController.changeUserProfile);

// admin routes
UserRoutes.get('/admin/users', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.getAllUser);
UserRoutes.delete('/admin/users/:id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.deleteUser);

module.exports = UserRoutes;