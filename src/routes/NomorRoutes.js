const NomorRoutes = require('express').Router();
const NomorController = require('../controllers/NomorController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

NomorRoutes.get('/', AuthMiddleware.checkToken, AuthMiddleware.checkUser, NomorController.getUserNomor);
NomorRoutes.put('/', AuthMiddleware.checkToken, AuthMiddleware.checkUser, NomorController.updateUserNomor);

NomorRoutes.get('/admin/damkar', AuthMiddleware.checkToken, AuthMiddleware.checkRole, NomorController.adminGetNomorDamkar);
NomorRoutes.get('/admin/all', AuthMiddleware.checkToken, AuthMiddleware.checkRole, NomorController.adminGetAllNomor);
NomorRoutes.post('/admin/damkar', AuthMiddleware.checkToken, AuthMiddleware.checkRole, NomorController.adminCreateNomorDamkar);
NomorRoutes.put('/admin/damkar', AuthMiddleware.checkToken, AuthMiddleware.checkRole, NomorController.adminUpdateNomorDamkar);

module.exports = NomorRoutes;