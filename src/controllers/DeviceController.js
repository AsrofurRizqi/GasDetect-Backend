const {
    device,
    user,
    Sequelize
} = require('../models');

const Op = Sequelize.Op;
const {v4: uuidv4} = require('uuid');
const { or } = require('sequelize');

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
                userId: user_id
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
                deviceName: device_name,
                deviceNumber: nextNumber,
                id: uuidv4(),
                userId: user_id,
                urlkey: keyRandom(),
                active: true
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
                id: device_id,
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
                    id: device_id,
                    userId: user_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Device successfully deleted'
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
                    userId: user_id
                },
                order: [
                    ['deviceNumber', 'ASC']
                ]
            });

            deviceData.forEach((item) => {
                delete item.dataValues.urlkey;
                delete item.dataValues.userId;
                delete item.dataValues.id;
            });

            return res.status(200).json({
                status: 200,
                message: 'Device found',
                data: deviceData
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error'
            });
        }
    },

    async getDeviceDetailsUser(req, res) {
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
                id: device_id,
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
            return res.status(200).json({
                status: 200,
                message: 'Device found',
                data: checkdevice
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error'
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
                    userId: user_id
                },
                order: [
                    ['deviceNumber', 'ASC']
                ]
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

    async adminDeleteDevice(req, res) {
        const {
            device_id
        } = req.params;

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
                deviceId: device_id
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
                    deviceId: device_id
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

    async adminUpdateDevice(req, res) {
        const {
            device_id,
            device_name
        } = req.body;

        try {
            if (device_id === '' || device_name === '') {
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
                deviceId: device_id
            }
        });

        if (!checkdevice) {
            return res.status(400).json({
                status: 400,
                message: 'Device not found'
            });
        }

        try {
            await device.update({
                device_name: device_name
            }, {
                where: {
                    deviceId: device_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Device updated'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getAllDevice(req, res) {
        try {
            const deviceData = await device.findAll({
                order: [
                    ['userId', 'ASC'],
                ]
            });

            return res.status(200).json({
                status: 200,
                message: 'Device found',
                data: deviceData
            });
            
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error'
            });
        }
    },

    async userDisableDevice(req, res) {
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
                id: device_id,
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
            await device.update({
                active: false
            }, {
                where: {
                    id: device_id,
                    userId: user_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Success disable device'
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                status: 500,
                message: "Internal server error"
            });
        }
    },

    async userEnableDevice(req, res) {
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
                id: device_id,
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
            await device.update({
                active: true
            }, {
                where: {
                    id: device_id,
                    userId: user_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Success enable device'
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                status: 500,
                message: "Internal server error"
            });
        }
    }
}