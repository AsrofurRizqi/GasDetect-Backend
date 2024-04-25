const NotifRoutes = require('express').Router();
const NotifController = require('../controllers/NotifController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

NotifRoutes.get('/notif', NotifController.getNotif);
NotifRoutes.post('/notif', NotifController.sendNotif);

module.exports = NotifRoutes;