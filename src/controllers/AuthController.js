const {
    user,
    Sequelize
} = require('../models');

const Op = Sequelize.Op;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NodeMailer = require('nodemailer');

module.exports = {
    async signup(req, res) {
        const {
            nama, 
            email, 
            password, 
            repassword
        } = req.body;

        try {
            if (nama === '' || email === '' || password === '' || repassword === '') {
                return res.status(400).json({
                    status: 400,
                    message: 'Please fill all field'
                });
            }
            if (password !== repassword) {
                return res.status(400).json({
                    status: 400,
                    message: 'Password not match'
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
                email: email
            }
        });

        if (checkuser) {
            return res.status(400).json({
                status: 400,
                message: 'Email already exist'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        try {
            const token = jwt.sign({email: email}, process.env.JWT_SECRET, {expiresIn: '2h'}, { algorithm: 'RS256' });

            await user.create({
                username: nama,
                email: email,
                password: hashPassword,
                is_verified: false,
                is_activated: false,
                avatar: 'https://res.cloudinary.com/dkxt6mlnh/image/upload/v1682927959/drown/images-removebg-preview_nmbyo7.png',
                role: 'user',
                phone: '0',
            });

            const transporter = NodeMailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Verify Account Email',
                html: `<!DOCTYPE html>
<html>
    <center> 
        <h1>Email Verification For User Account ${nama}</h1>
        <p>Click this link to verify your email, valid for 2 hours</p>
        <div>
            <img src="https://res.cloudinary.com/dkxt6mlnh/image/upload/v1691564307/sobermart/sob-logos-1_bnnccj.png" alt="Drown Logo" width="310" height="85">
        </div>
        <button 
            style=
            "
            border: none;
            transition-duration: 0.4s;
            cursor: pointer;
            background-color: #76b5c3;
            margin-top: 20px;
            border-radius: 12px;
            "
            type="button"
        > 
            <a 
            style=
            "
            text-decoration: none;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;color: white;
            padding: 10px 32px;
            transition-duration: 0.4s;" 
            href='${process.env.BASE_URL}api/auth/verify/${token}'>Verify Email</a>
        </button>
        <center>
</html>`
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return res.status(500).json({
                        status: 500,
                        message: err.message
                    });
                } else {
                    return res.status(200).json({
                        status: 200,
                        message: 'Email sent'
                    });
                }
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({
                message: "Internal Error",
                status: 500,
            });
        }

    },

    async signin(req, res) {
        const {
            email,
            password
        } = req.body;

        try {
            if (email === '' || password === '') {
                return res.status(400).json({
                    status: 400,
                    message: 'Please fill all field'
                });
            }

            const checkuser = await user.findOne({
                where: {
                    email: email
                }
            });
    
            if (!checkuser) {
                return res.status(400).json({
                    status: 400,
                    message: 'Account not found'
                });
            }
    
            const validPass = await bcrypt.compare(password, checkuser.password);
    
            if (!validPass) {
                return res.status(400).json({
                    status: 400,
                    message: 'Password not match'
                });
            }

            const payload = {
                id: checkuser.id,
                name: checkuser.name,
            }
    
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'});
    
            return res.status(200).json({
                status: 200,
                message: 'Login success',
                token: token
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async verify(req, res) {
        const token = req.params.token;

        if (!token) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid token'
            });
        }

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);

            await user.update({
                status: 'active'
            }, {
                where: {
                    email: verified.email
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Email verified'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async forgotPassword(req, res) {
        const {
            email
        } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 400,
                message: 'Please fill email field'
            });
        }

        const checkuser = await user.findOne({
            where: {
                email: email
            }
        });

        if (!checkuser) {
            return res.status(400).json({
                status: 400,
                message: 'Email not found'
            });
        }

        const token = jwt.sign({email: email}, process.env.JWT_SECRET, {expiresIn: '2h'});

        const transporter = NodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Reset Password Sobermart',
            html: `<!DOCTYPE html> 
<html>
    <center> 
        <h1>Reset Password For ${checkuser.name}</h1>
        <p>Click this link to reset your password, valid for 2 hours</p>
        <div>
            <img src="https://res.cloudinary.com/dkxt6mlnh/image/upload/v1691564307/sobermart/sob-logos-1_bnnccj.png" alt="Drown Logo" width="310" height="85">
        </div>
        <button 
            style=
            "
            border: none;
            transition-duration: 0.4s;
            cursor: pointer;
            background-color: #76b5c3;
            margin-top: 20px;
            border-radius: 12px;
            "
            type="button"
        > 
            <a 
            style=
            "
            text-decoration: none;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;color: white;
            padding: 10px 32px;
            transition-duration: 0.4s;" 
            href='${process.env.BASE_URL}api/auth/reset/${token}'>Reset Password</a>
        </button>
        <center>
</html>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    message: err.message
                });
            } else {
                return res.status(200).json({
                    status: 200,
                    message: 'Email sent'
                });
            }
        });
    }
}