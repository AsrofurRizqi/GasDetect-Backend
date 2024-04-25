const DataRoutes = require('express').Router();
const DataController = require('../controllers/DataController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

DataRoutes.get('/data', DataController.getData);
DataRoutes.post('/data', DataController.insertData);

module.exports = DataRoutes;