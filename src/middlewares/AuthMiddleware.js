const {
    user,
    device,
    Sequelize
} = require("../models");

const op = Sequelize.Op;
const jwt = require('jsonwebtoken');

module.exports = {
    async checkToken(req, res, next) {
        let token = req.headers['authorization'];
        if (!token) {
            return res.status(401).send({
                message: 'Token is required'
            });
        }

        try {
            const bearer = token.split(' ');
            if (bearer.length !== 2) {
                return res.status(401).send({
                    message: 'Invalid token, token must be in format Bearer <token>'
                });
            }

            if (bearer[0] !== 'Bearer') {
                return res.status(401).send({
                    message: 'Invalid token, token must be in format Bearer <token>'
                });
            }

            token = bearer[1];
        } catch (error) {
            return res.status(401).send({
                message: 'Invalid token, token must be in format Bearer <token>'
            });
        }

        try {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodeToken;
        } catch (error) {
            return res.status(401).send({
                message: 'Invalid token'
            });
        }
        const userExists = await user.findOne({
            where: {
                id : req.user.id
            }
        });

        if (!userExists) {
            return res.status(401).send({
                message: 'Invalid token, user not found'
            });
        }

        req.user = userExists;
        next();
    },

    async checkRole(req, res, next) {
        if (req.user.role !== 'admin') {
            return res.status(401).send({
                message: 'You are not allowed to access this route'
            });
        }

        next();
    },

    async checkUser(req, res, next) {
        if (req.user.role !== 'user') {
            return res.status(401).send({
                message: 'You are not allowed to access this route'
            });
        }

        next();
    },

    async deviceAuth(req, res, next) {
        const key = req.headers['key'];
        
        if (!key) {
            return res.status(401).send({
                message: 'Key is required'
            });
        }

        const deviceExists = await device.findOne({
            where: {
                urlkey: key       
            }
        });

        if (!deviceExists) {
            return res.status(401).send({
                message: 'Invalid key'
            });
        }

        if (!deviceExists.active) {
            return res.status(410).send({
                message: 'Device is not active'
            });
        }

        const userExists = await user.findOne({
            where: {
                id: deviceExists.userId
            }
        });

        if (!userExists) {
            return res.status(401).send({
                message: 'Invalid key, user owner not found'
            });
        }

        req.device = deviceExists;
        req.user = userExists;
        next();

    }
}