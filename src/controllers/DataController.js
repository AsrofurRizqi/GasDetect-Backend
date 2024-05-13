const {
    data,
    Sequelize,
    user
} = require('../models');

const Op = Sequelize.Op;
const bcrypt = require('bcrypt');

module.exports = {
    async getData(req, res) {
        const {
            suhu,
            kelembapan,
            ph,
            turbidity,
        } = req.body;

        const user_id = req.user.id;

        try {
            if (suhu === '' || kelembapan === '' || ph === '' || turbidity === '' || user_id === '') {
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
            const dataByUser = await data.findAll({
                where: {
                    userId: user_id
                }
            });

            let dataGroup = {};
            dataByUser.forEach((item) => {
                if (!dataGroup[item.deviceId]) {
                    dataGroup[item.deviceId] = [];
                }
                dataGroup[item.deviceId].push(item);
            });

            return res.status(200).json({
                status: 200,
                message: 'Data found',
                data: dataGroup,
            });
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDataByDateRange(req, res) {
        const {
            start_date,
            end_date
        } = req.body;

        const user_id = req.user.id;

        try {
            if (start_date === '' || end_date === '') {
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
            const dataByDate = await data.findAll({
                where: {
                    userId: user_id,
                    createdAt: {
                        [Op.between]: [start_date, end_date]
                    }
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Data found',
                data: dataByDate,
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDataByIdDevice(req, res) {
        const user_id = req.user.id;
        const deviceId = req.params.device_id;

        try {
            if (deviceId === '') {
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
            const dataById = await data.findAll({
                where: {
                    userId: user_id,
                    deviceId: deviceId
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Data found',
                data: dataById,
            });
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async insertData(req, res) {
        const {
            suhu,
            kelembapan,
            ph,
            turbidity,
            userId,
            deviceId
        } = req.body;

        try {
            if (suhu === '' || kelembapan === '' || ph === '' || turbidity === '' || userId === '' || deviceId === '') {
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
                id: userId
            }
        });

        if (!checkuser) {
            return res.status(400).json({
                status: 400,
                message: 'User not found'
            });
        }

        try {
            await data.create({
                suhu: suhu,
                kelembapan: kelembapan,
                ph: ph,
                turbidity: turbidity,
                userId: userId,
                deviceId: deviceId
            });

            return res.status(201).json({
                status: 201,
                message: 'Data saved'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async deleteDataByDateRange(req, res) {
        const {
            deviceId,
            start_date,
            end_date
        } = req.body;

        const user_id = req.user.id;

        try {
            if (deviceId === '' || start_date === '' || end_date === '') {
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
            await data.destroy({
                where: {
                    userId: user_id,
                    deviceId: deviceId,
                    createdAt: {
                        [Op.between]: [start_date, end_date]
                    }
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Data deleted'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async deleteAllDataByDeviceId(req, res) {
        const {
            deviceId
        } = req.body;

        const user_id = req.user.id;

        try {
            if (deviceId === '') {
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
            await data.destroy({
                where: {
                    userId: user_id,
                    deviceId: deviceId
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Data deleted'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    }
}