const DataRoutes = require('express').Router();
const DataController = require('../controllers/DataController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

DataRoutes.get('/', AuthMiddleware.checkToken, AuthMiddleware.checkUser, DataController.getData);
DataRoutes.get('/date', AuthMiddleware.checkToken, AuthMiddleware.checkUser, DataController.getDataByDateRange);
DataRoutes.get('/device/:device_id', AuthMiddleware.checkToken, AuthMiddleware.checkUser, DataController.getDataByDeviceId);
// device routes
DataRoutes.post('/', AuthMiddleware.deviceAuth, DataController.insertDataDevice);

// admin
DataRoutes.get('/admin', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.getAllData);
DataRoutes.get('/admin/details/:data_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.getDataDetails);
DataRoutes.get('/admin/device/:device_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.getDataByDeviceId);
DataRoutes.get('/admin/user/:user_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.getDataByUserId);
DataRoutes.post('/admin', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.insertDataAdmin);
DataRoutes.delete('/admin/date', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.deleteDataByDateRange);
DataRoutes.delete('/admin/device/:device_id', AuthMiddleware.checkToken, AuthMiddleware.checkRole, DataController.deleteAllDataByDeviceId);

//test routes
DataRoutes.get('/test', DataController.getAllData);

module.exports = DataRoutes;