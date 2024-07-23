const {
    user,
    device,
    Sequelize,
    nomor
} = require('../models');

const Op = Sequelize.Op;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NodeMailer = require('nodemailer');
const Mailjet = require('node-mailjet');
const mailjet = Mailjet.APIKeyConfiguration({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_API_SECRET
});
const {v4: uuidv4} = require('uuid');

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
                message: 'Email already used'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        try {
            const token = jwt.sign({email: email}, process.env.JWT_SECRET, {expiresIn: '2h'}, { algorithm: 'RS256' });

            const createUser = await user.create({
                id: uuidv4(),
                username: nama,
                email: email,
                password: hashPassword,
                is_verified: false,
                is_activated: false,
                avatar: '',
                role: 'user',
                phone: '0',
            });

            await nomor.create({
                id: uuidv4(),
                userId: createUser.id,
                nomor1: '0',
                nomor2: '0',
                nomor3: '0'
            });

            const request = mailjet
                .post("send", { 'version': 'v3.1' })
                .request({
                    Messages: [
                        {
                            From: {
                                Email: process.env.EMAIL,
                                Name: "Kuro Gas Detect"
                            },
                            To: [
                                {
                                    Email: email,
                                    Name: nama
                                }
                            ],
                            Subject: "Verify Account Email",
                            HTMLPart: `<!DOCTYPE html>
        <html>
            <center> 
                <h1>Email Verification For User Account ${nama}</h1>
                <p>Click this link to verify your email, valid for 2 hours</p>
                <div>
                    <img src="https://res.cloudinary.com/dkxt6mlnh/image/upload/v1715693998/ta/tfohwr0b93k82g389azl.png" alt="Drown Logo" width="452" height="115">
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
                        }
                    ]
                });
            
            try {
                const result = await request;
                return {
                    status: 200,
                    message: 'Account created, please verify your email'
                };
            } catch (err) {
                if (err.statusCode === 400) {
                    return {
                        status: 500,
                        message: 'Email not valid'
                    };
                } else {
                    return {
                        status: 500,
                        message: err.message
                    };
                }
            }

            
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

            if (!checkuser.is_verified) {
                return res.status(400).json({
                    status: 400,
                    message: 'Please verify your email'
                });
            }

            if (!checkuser.is_activated) {
                return res.status(400).json({
                    status: 400,
                    message: 'Please contact admin to activate your account'
                });
            }

            const payload = {
                id: checkuser.id,
                name: checkuser.name,
            }
    
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'}, { algorithm: 'RS256' });
    
            return res.status(200).json({
                status: 200,
                message: 'Login success',
                role: checkuser.role,
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

            const checkAlreadyVerified = await user.findOne({
                where: {
                    email: verified.email
                }
            });

            if (checkAlreadyVerified.is_verified) {
                return res.render("alreadyEmail.ejs")
            }

            const update = await user.update({
                is_verified: true
            }, {
                where: {
                    email: verified.email
                }
            });

            if (update[0] === 0) {
                return res.status(400).json({
                    status: 400,
                    message: 'Account not found, Token not valid'
                });
            }

            return res.render("verifEmail.ejs")
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
            subject: 'Reset Password Gas Detect',
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
    },

    async pageChangePassword(req, res) {
        const token = req.params.token;

        if (!token) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid token'
            });
        }

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);

            return res.render("resetPassword.ejs", {token: token});
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async resetPassword(req, res) {
        const {
            password,
            repassword
        } = req.body;

        const token = req.params.token;

        if (!token) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid token'
            });
        }

        if (password !== repassword) {
            return res.status(400).json({
                status: 400,
                message: 'Password not match'
            });
        }

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            const update = await user.update({
                password: hashPassword
            }, {
                where: {
                    email: verified.email
                }
            });

            if (update[0] === 0) {
                return res.status(400).json({
                    status: 400,
                    message: 'Account not found, Token not valid'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Password updated'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async userChangePassword(req, res) {
        const {
            oldpassword,
            newpassword,
            renewpassword
        } = req.body;

        const user_id = req.user.id;

        if (newpassword !== renewpassword) {
            return res.status(400).json({
                status: 400,
                message: 'Password not match on new password and renew password'
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
                message: 'Account not found'
            });
        }

        const validPass = await bcrypt.compare(oldpassword, checkuser.password);

        if (!validPass) {
            return res.status(400).json({
                status: 400,
                message: 'Password account not match'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newpassword, salt);

        const update = await user.update({
            password: hashPassword
        }, {
            where: {
                id: user_id
            }
        });

        if (update[0] === 0) {
            return res.status(400).json({
                status: 400,
                message: 'Account not found'
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Password updated'
        });
    },

    async tokenCheck(req, res) {
        return res.status(200).json({
            status: 200,
            username: req.user.name,
            message: 'Token valid'
        });
    },

    async checkUserFromUrlkeyDevice(req, res) {
        try {
            const user_id = req.device.userId;

            const checkUser = await user.findOne({
                where: {
                    id: user_id
                }
            });

            if (!checkUser) {
                return res.status(400).json({
                    status: 400,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                user: checkUser.username
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: "Internal Error"
            });
        }
    }
}