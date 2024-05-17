const UserRoutes = require('express').Router();
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const UploadMiddleware = require('../middlewares/UploadMiddleware');

// user routes
UserRoutes.get('/profiles', AuthMiddleware.checkToken, AuthMiddleware.checkUser, UserController.getUserProfile);
UserRoutes.put('/update', AuthMiddleware.checkToken, AuthMiddleware.checkUser, UploadMiddleware.singleUpload, AuthMiddleware.checkUser, UserController.changeUserProfile);

// admin routes
UserRoutes.get('/admin', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.getAllUser);
UserRoutes.get('/admin/:id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.getUserById);
UserRoutes.post('/admin', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UploadMiddleware.singleUpload, UserController.createUser);
UserRoutes.post('/admin/activate', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.activateUser);
UserRoutes.post('/admin/deactivate', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.deactivateUser);
UserRoutes.delete('/admin/:id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, UserController.deleteUser);

module.exports = UserRoutes;