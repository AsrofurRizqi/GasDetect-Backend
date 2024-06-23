const {
    user,
    nomor,
    Sequelize,
    damkar
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

    async adminCreateNomorDamkar(req, res) {
        const {
            nomor
        } = req.body;

        const id = req.user.id;

        try {
            await damkar.create({
                id: uuidv4(),
                userId: id,
                nomor
            });

            return res.status(201).json({
                message: 'Nomor created'
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    },

    async adminUpdateNomorDamkar(req, res) {
        const {
            nomor
        } = req.body;

        const id = req.user.id;

        try {
            const damkarNomor = await damkar.findOne({
                where: {
                    userId: id
                }
            });

            await damkar.update({
                nomor: nomor ? nomor : damkarNomor.nomor
            }, {
                where: {
                    userId: id
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

    async adminGetNomorDamkar(req, res) {
        const id = req.user.id;

        try {
            const damkarNomor = await damkar.findOne({
                where: {
                    userId: id
                }
            });

            return res.status(200).json({
                data: damkarNomor
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    },

    async adminGetAllNomor(req, res) {
        try {
            const allNomor = await nomor.findAll();

            return res.status(200).json({
                data: allNomor
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    },
}