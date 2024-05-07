const UserRoutes = require('express').Router();
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const UploadMiddleware = require('../middlewares/UploadMiddleware');

// user routes
UserRoutes.get('/users/:id', AuthMiddleware.checkToken, AuthMiddleware.checkUser, UserController.getUserProfile);
UserRoutes.put('/users/:id', AuthMiddleware.checkToken, UploadMiddleware.singleUpload, AuthMiddleware.checkUser, UserController.changeUserProfile);

// admin routes
UserRoutes.get('/admin/users', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.getAllUser);
UserRoutes.get('/admin/users/:id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.getUserProfile);
UserRoutes.post('/admin/users', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UploadMiddleware.singleUpload, UserController.createUser);
UserRoutes.delete('/admin/users/:id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.deleteUser);

module.exports = UserRoutes;