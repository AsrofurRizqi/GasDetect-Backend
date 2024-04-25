const {
    user,
    Sequelize
} = require('../models');

const Op = Sequelize.Op;
const bcrypt = require('bcrypt');
const {v4: uuid} = require('uuid');

module.exports = {
    async getUserProfile(req, res) {
        const {
            user_id
        } = req.body;

        try {
            if (user_id === '') {
                return res.status(400).json({
                    message: 'Please fill all field'
                });
            }
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }

        const checkuser = await user.findOne({
            where: {
                id: user_id
            }
        });

        if (!checkuser) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User found',
            data: checkuser
        });
    },

    async changeUserProfile(req, res) {
        const {
            user_id,
            username,
            email,
            password
        } = req.body;

        try {
            if (user_id === '' || username === '' || email === '' || password === '') {
                return res.status(400).json({
                    message: 'Please fill all field'
                });
            }
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }

        const checkuser = await user.findOne({
            where: {
                id: user_id
            }
        });

        if (!checkuser) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        try {
            await user.update({
                username: username,
                email: email,
                password: bcrypt.hashSync(password, 10)
            }, {
                where: {
                    id: user_id
                }
            });

            return res.status(200).json({
                message: 'User updated'
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    },

    async getAllUser(req, res) {
        try {
            const users = await user.findAll();
            return res.status(200).json({
                message: 'All users',
                data: users
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    },

    async deleteUser(req, res) {
        const {
            user_id
        } = req.body;

        try {
            if (user_id === '') {
                return res.status(400).json({
                    message: 'Please fill all field'
                });
            }
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }

        const checkuser = await user.findOne({
            where: {
                id: user_id
            }
        });

        if (!checkuser) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        try {
            await user.destroy({
                where: {
                    id: user_id
                }
            });

            return res.status(200).json({
                message: 'User deleted'
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    }
}