const {
    notification,
    user
} = require('../models');
const PDFDocument = require('pdfkit');

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

    async getAllNotif(req, res) {
        try {
            const notifData = await notification.findAndCountAll({
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

    async downloadDataPDF(req, res) {
        const user_id = req.user.id;

        try {
            const notifData = await notification.findAndCountAll({
                where: {
                    user_id: user_id
                }
            });
    
            const doc = new PDFDocument();
            res.setHeader('Content-disposition', 'attachment; filename=notifications.pdf');
            res.setHeader('Content-type', 'application/pdf');
    
            doc.pipe(res);
    
            doc.fontSize(25).text('Notifications', { align: 'center' });
            doc.moveDown();
    
            notifData.rows.forEach((notification, index) => {
                doc.fontSize(12).text(`Notification ${index + 1}`, { underline: true });
                doc.text(`ID: ${notification.id}`);
                doc.text(`Status: ${notification.status}`);
                doc.text(`Level: ${notification.level}`);
                doc.text(`Location: ${notification.location}`);
                doc.text(`Created At: ${notification.createdAt}`);
                doc.moveDown();
            });
    
            doc.end();
    
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    }

}