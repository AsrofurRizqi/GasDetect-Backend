const {
    device,
    user,
    Sequelize
} = require('../models');

const Op = Sequelize.Op;
const {v4: uuid} = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
    async addDevice(req, res) {
        const {
            device_name,
            user_id
        } = req.body;

        try {
            if (device_name === '' || user_id === '') {
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
            await device.create({
                device_name: device_name,
                device_id: uuid(),
                user_id: user_id
            });

            return res.status(200).json({
                message: 'Device added'
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    },

    async deleteDevice(req, res) {
        const {
            device_id
        } = req.body;

        try {
            if (device_id === '') {
                return res.status(400).json({
                    message: 'Please fill all field'
                });
            }
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }

        const checkdevice = await device.findOne({
            where: {
                device_id: device_id
            }
        });

        if (!checkdevice) {
            return res.status(400).json({
                message: 'Device not found'
            });
        }

        try {
            await device.destroy({
                where: {
                    device_id: device_id
                }
            });

            return res.status(200).json({
                message: 'Device deleted'
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    },

    async getDevice(req, res) {
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
            const deviceData = await device.findAll({
                where: {
                    user_id: user_id
                }
            });

            return res.status(200).json({
                message: 'Device found',
                data: deviceData
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    }
}