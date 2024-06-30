const axios = require('axios');
const {
    notification,
    user,
    nomor
} = require('../models');

// whatsapp business api
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports = {
    async sendNotif(req, res) {
        const {
            title,
            message,
            user_id
        } = req.body;

        try {
            if (title === '' || message === '' || user_id === '') {
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
            await notification.create({
                title: title,
                message: message,
                user_id: user_id
            });

            // send whatsapp
            client.messages
                .create({
                    from: 'whatsapp:+14155238886',
                    body: `${title}\n${message}`,
                    to: `whatsapp:+62${checkuser.phone}`
                })
                .then(message => console.log(message.sid))
                .done();

            return res.status(200).json({
                status: 200,
                message: 'Notif sent'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
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

            notifData.map(data => {
                data.location = data.location.split(',');
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

    async verifyNumber(req, res) {
        const {
            phone
        } = req.body;

        try {
            if (phone === '') {
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

        try {
            const response = await axios.get(`https://api.whatsapp.com/send?phone=${phone}`);

            if (response.status === 200) {
                return res.status(200).json({
                    status: 200,
                    message: 'Number verified'
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