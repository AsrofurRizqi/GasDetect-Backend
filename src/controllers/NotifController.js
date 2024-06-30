const {
    notification,
    user
} = require('../models');

module.exports = {
    async getNotifUser(req, res) {
        const user_id = req.user.id;

        try {
            const notifData = await notification.findAndCountAll({
                where: {
                    userId: user_id
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            if (notifData.count === 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'No notif found'
                });
            } else {
                return res.status(200).json({
                    status: 200,
                    message: 'Notif found',
                    data: notifData
                });
            }
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getNotifByUser(req, res) {
        const {
            user_id
        } = req.body;

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
            const notifData = await notification.findAndCountAll({
                where: {
                    user_id: user_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Notif found',
                data: notifData
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

}