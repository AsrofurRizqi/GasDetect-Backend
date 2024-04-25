const {
    user,
    Sequelize
} = require("../models");

const op = Sequelize.Op;

module.exports = {
    async checkToken(req, res, next) {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).send({
                message: 'Token is required'
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
                email : req.user.email
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
    }
}