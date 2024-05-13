const DataRoutes = require('express').Router();
const DataController = require('../controllers/DataController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

DataRoutes.get('/data', AuthMiddleware.checkToken, DataController.getData);
DataRoutes.get('/data/date', AuthMiddleware.checkToken, DataController.getDataByDateRange);
DataRoutes.get('/data/device/:device_id', AuthMiddleware.checkToken, DataController.getDataByIdDevice);

// device routes
DataRoutes.post('/data', AuthMiddleware.deviceAuth, DataController.insertData);

// admin
DataRoutes.delete('/data/date', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.deleteDataByDateRange);
DataRoutes.delete('/data/device/:device_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.deleteAllDataByDeviceId);

module.exports = DataRoutes;