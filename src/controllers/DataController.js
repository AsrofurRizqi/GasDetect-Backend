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
            user_id
        } = req.body;

        try {
            if (suhu === '' || kelembapan === '' || ph === '' || turbidity === '' || user_id === '') {
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
            await data.create({
                suhu: suhu,
                kelembapan: kelembapan,
                ph: ph,
                turbidity: turbidity,
                user_id: user_id
            });

            return res.status(200).json({
                message: 'Data saved'
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    },

    async getDataById(req, res) {
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
            const dataById = await data.findAll({
                where: {
                    user_id: user_id
                }
            });

            return res.status(200).json({
                message: 'Data found',
                data: dataById,
            });
        }
        catch (e) {
            return res.status(500).json({
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
            user_id
        } = req.body;

        try {
            if (suhu === '' || kelembapan === '' || ph === '' || turbidity === '' || user_id === '') {
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
            await data.create({
                suhu: suhu,
                kelembapan: kelembapan,
                ph: ph,
                turbidity: turbidity,
                user_id: user_id
            });

            return res.status(200).json({
                message: 'Data saved'
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    }
}