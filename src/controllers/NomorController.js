const {
    user,
    nomor,
    Sequelize
} = require('../models');

const Op = Sequelize.Op;
const {v4: uuidv4} = require('uuid');

module.exports = {
    async updateUserNomor(req, res) {
        const {
            nomor1,
            nomor2,
            nomor3
        } = req.body;

        const userId = req.user.id;

        try {
            const userNomor = await nomor.findOne({
                where: {
                    userId
                }
            });

            await nomor.update({
                nomor1: nomor1 ? nomor1 : userNomor.nomor1,
                nomor2: nomor2 ? nomor2 : userNomor.nomor2,
                nomor3: nomor3 ? nomor3 : userNomor.nomor3
            }, {
                where: {
                    userId
                }
            });

            return res.status(200).json({
                message: 'Nomor updated'
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    },

    async getUserNomor(req, res) {
        const userId = req.user.id;

        try {
            const userNomor = await nomor.findOne({
                where: {
                    userId
                }
            });

            return res.status(200).json({
                data: userNomor
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    },
}