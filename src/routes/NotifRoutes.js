const NotifRoutes = require('express').Router();
const NotifController = require('../controllers/NotifController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

NotifRoutes.get('/', NotifController.getNotifUser);
NotifRoutes.post('/', NotifController.sendNotif);

// admin
NotifRoutes.get('/admin/:user_id', AuthMiddleware.checkToken , AuthMiddleware.checkRole , NotifController.getNotifByUser);

module.exports = NotifRoutes;