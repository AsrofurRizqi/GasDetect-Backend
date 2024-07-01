const NotifRoutes = require('express').Router();
const NotifController = require('../controllers/NotifController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

NotifRoutes.get('/', AuthMiddleware.checkToken, AuthMiddleware.checkUser, NotifController.getNotifUser);

NotifRoutes.get('/admin', AuthMiddleware.checkToken , AuthMiddleware.checkRole , NotifController.getAllNotif);
NotifRoutes.get('/admin/:user_id', AuthMiddleware.checkToken , AuthMiddleware.checkRole , NotifController.getNotifByUser);

module.exports = NotifRoutes;