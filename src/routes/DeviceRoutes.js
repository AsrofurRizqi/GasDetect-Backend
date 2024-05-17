const DeviceRoutes = require('express').Router();
const DeviceController = require('../controllers/DeviceController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

DeviceRoutes.get('/', AuthMiddleware.checkToken, AuthMiddleware.checkUser, DeviceController.getDeviceUser);
DeviceRoutes.get('/details/:device_id', AuthMiddleware.checkToken, AuthMiddleware.checkUser, DeviceController.getDeviceDetailsUser);
DeviceRoutes.post('/', AuthMiddleware.checkToken, AuthMiddleware.checkUser, DeviceController.addDeviceUser);
DeviceRoutes.delete('/:device_id', AuthMiddleware.checkToken, AuthMiddleware.checkUser,DeviceController.deleteDeviceUser);

// admin
DeviceRoutes.get('/admin', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DeviceController.getAllDevice);
DeviceRoutes.get('/admin/user/:user_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DeviceController.getDeviceByUser);
DeviceRoutes.delete('/admin/:device_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DeviceController.adminDeleteDevice);
DeviceRoutes.put('/admin', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DeviceController.adminUpdateDevice);
module.exports = DeviceRoutes;