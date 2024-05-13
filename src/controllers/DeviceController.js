const {
    device,
    user,
    Sequelize
} = require('../models');

const Op = Sequelize.Op;
const {v4: uuid} = require('uuid');
const bcrypt = require('bcrypt');

function keyRandom() {
    let key = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 16; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
}

module.exports = {
    async addDeviceUser(req, res) {
        const {
            device_name,
        } = req.body;

        const user_id = req.user.id;

        try {
            if (device_name === '') {
                return res.status(400).json({
                    status: 400,
                    message: 'Please fill all field'
                });
            }
        } catch (e) {
            return res.status(500).json({
                status: 500,
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
                status: 400,
                message: 'User not found'
            });
        }

        const deviceNumber = await device.count({
            where: {
                user_id: user_id
            }
        });

        if (deviceNumber >= 3) {
            return res.status(400).json({
                status: 400,
                message: 'You have reached the maximum number of devices'
            });
        }

        const nextNumber = deviceNumber + 1;

        try {
            const createDev = await device.create({
                device_name: device_name,
                deviceNumber: nextNumber,
                device_id: uuid(),
                user_id: user_id,
                urlkey: keyRandom()
            });

            return res.status(201).json({
                status: 201,
                message: 'Device added',
                name : createDev.device_name,
                key : createDev.urlkey
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async deleteDeviceUser(req, res) {
        const {
            device_id
        } = req.params;

        const user_id = req.user.id;

        try {
            if (device_id === '') {
                return res.status(400).json({
                    status: 400,
                    message: 'Please fill all field'
                });
            }
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }

        const checkdevice = await device.findOne({
            where: {
                deviceId: device_id,
                userId: user_id
            }
        });

        if (!checkdevice) {
            return res.status(400).json({
                status: 400,
                message: 'Device not found'
            });
        }

        try {
            await device.destroy({
                where: {
                    deviceId: device_id,
                    userId: user_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Device deleted'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDeviceUser(req, res) {
        const user_id = req.user.id;

        try {
            const deviceData = await device.findAll({
                where: {
                    user_id: user_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Device found',
                data: deviceData
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDeviceByUser(req, res) {
        const {
            user_id
        } = req.params;
        try {
            if (user_id === '') {
                return res.status(400).json({
                    status: 400,
                    message: 'Please fill all field'
                });
            }
        } catch (e) {
            return res.status(500).json({
                status: 500,
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
                status: 400,
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
                status: 200,
                message: 'Device found',
                data: deviceData
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    }
}