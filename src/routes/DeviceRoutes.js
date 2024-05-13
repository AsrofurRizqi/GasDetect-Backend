const DeviceRoutes = require('express').Router();
const DeviceController = require('../controllers/DeviceController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

DeviceRoutes.get('/devices', DeviceController.getDeviceUser);
DeviceRoutes.post('/devices', DeviceController.addDeviceUser);
DeviceRoutes.delete('/devices/:device_id', DeviceController.deleteDeviceUser);

// admin
DeviceRoutes.get('/devices/admin/user/:user_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DeviceController.getDeviceByUser);
module.exports = DeviceRoutes;