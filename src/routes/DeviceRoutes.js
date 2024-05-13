const DeviceRoutes = require('express').Router();
const DeviceController = require('../controllers/DeviceController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

DeviceRoutes.get('/', DeviceController.getDeviceUser);
DeviceRoutes.post('/', DeviceController.addDeviceUser);
DeviceRoutes.delete('/:device_id', DeviceController.deleteDeviceUser);

// admin
DeviceRoutes.get('/admin/user/:user_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DeviceController.getDeviceByUser);
DeviceRoutes.delete('/admin/:device_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DeviceController.adminDeleteDevice);
DeviceRoutes.put('/admin', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DeviceController.adminUpdateDevice);
module.exports = DeviceRoutes;