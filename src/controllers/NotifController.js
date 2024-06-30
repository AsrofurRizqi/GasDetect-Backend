const axios = require('axios');
const twilio = require('twilio');
const {
    notification,
    user,
    nomor
} = require('../models');

// whatsapp business api
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

module.exports = {
    async sendNotif(req, res) {
        const {
            title,
            message,
        } = req.body;

        try {
            const send = await client.messages.create({
                    from: 'whatsapp:+14155238886',
                    body: `${title}\n${message}`,
                    to: `whatsapp:+6281476656815`
                })

            return res.status(200).json({
                status: 200,
                message: 'Notif sent',
                sid: send.sid,
                date: send.dateCreated,
                data: send.body
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e
            });
        }
    },

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