const DataRoutes = require('express').Router();
const DataController = require('../controllers/DataController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

DataRoutes.get('/', AuthMiddleware.checkToken, DataController.getData);
DataRoutes.get('/date', AuthMiddleware.checkToken, DataController.getDataByDateRange);
DataRoutes.get('/device/:device_id', AuthMiddleware.checkToken, DataController.getDataByIdDevice);

// device routes
DataRoutes.post('/', AuthMiddleware.deviceAuth, DataController.insertDataDevice);

// admin
DataRoutes.post('/admin', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.insertDataAdmin);
DataRoutes.delete('/admin/date', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.deleteDataByDateRange);
DataRoutes.delete('/admin/device/:device_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.deleteAllDataByDeviceId);

module.exports = DataRoutes;