const DeviceRoutes = require('express').Router();
const DeviceController = require('../controllers/DeviceController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

DeviceRoutes.get('/devices', DeviceController.getDevice);
DeviceRoutes.post('/devices', DeviceController.addDevice);
DeviceRoutes.delete('/devices/:id', DeviceController.deleteDevice);

module.exports = DeviceRoutes;