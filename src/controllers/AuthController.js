const {
    user,
    device,
    Sequelize,
    nomor
} = require('../models');

const axios = require('axios');
const Op = Sequelize.Op;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_APIKEY});
const {v4: uuidv4} = require('uuid');

module.exports = {
    async signup(req, res) {
        const {
            nama, 
            email, 
            phone,
            password, 
            repassword,
            qr_code
        } = req.body;

        try {
            if (nama === '' || email === '' || password === '' || repassword === '' || phone === '' || qr_code === '' || !nama || !email || !password || !repassword || !phone || !qr_code) {
                return res.status(400).json({
                    status: 400,
                    message: 'All field is required'
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
        };

        const phoneRegex = /^08[0-9]{10,13}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                status: 400,
                message: 'Phone number not valid'
            });
        };

        const checkuser = await user.findOne({
            where: {
                email: email
            }
        });

        if (checkuser) {
            return res.status(400).json({
                status: 400,
                message: 'Account already exist'
            });
        };

        const checkQrCode = await device.findOne({
            where: {
                urlkey: qr_code
            }
        });

        if (checkQrCode) {
            return res.status(400).json({
                status: 400,
                message: 'Device already registered on other account'
            });
        };

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
                phone: phone
            });

            await nomor.create({
                id: uuidv4(),
                userId: createUser.id,
                nomor1: phone,
                nomor2: '0',
                nomor3: '0'
            });

            await device.create({
                id: uuidv4(),
                deviceName: 'Device 1',
                deviceNumber: 1,
                userId: createUser.id,
                urlkey: qr_code,
                active: true
            });

            const emailHtml = `<!DOCTYPE html>
            <html>
                <center> 
                    <h1>Email Verification For User Account ${nama}</h1>
                    <p>Click this link to verify your email, valid for 2 hours</p>
                    <div>
                        <img src="https://res.cloudinary.com/dkxt6mlnh/image/upload/v1715693998/ta/tfohwr0b93k82g389azl.png" alt="Drown Logo" width="452" height="115">
                    </div>
                    <button 
                        style="
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
                        style="
                        text-decoration: none;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        color: white;
                        padding: 10px 32px;
                        transition-duration: 0.4s;" 
                        href='${process.env.BASE_URL}api/auth/verify/${token}'>Verify Email</a>
                    </button>
                    <center>
            </html>`;
            
            try {
                await mg.messages.create('mg.kuroshop.my.id', {
                    from: "Kuro Gas Detect <mailgun@mg.kuroshop.my.id>",
                    to: [email],
                    subject: "Verify Account Email",
                    text: "Click the link to verify your email",
                    html: emailHtml
                });
            } catch (err) {
                console.log(err);
                return res.status(500).json({
                    status: 500,
                    message: 'Failed to send verification email'
                });
            }

            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

            try {
                await delay(5000);
                const responseCheck = await axios.get(`https://api.mailgun.net/v3/mg.kuroshop.my.id/events`, {
                    auth: {
                        username: 'api',
                        password: process.env.MAILGUN_APIKEY
                    },
                    params: {
                        'limit': 4,
                        'recipient': email,
                        'event': 'failed',
                        'ascending': 'no'
                    }
                });
        
                if (responseCheck.data.items.length === 0) {
                    return res.status(200).json({
                        status: 200,
                        message: 'Account created, please verify your email'
                    });
                } else {
                    await user.destroy({
                        where: {
                            id: createUser.id
                        }
                    });

                    await nomor.destroy({
                        where: {
                            userId: createUser.id
                        }
                    });

                    await device.destroy({
                        where: {
                            userId: createUser.id
                        }
                    });

                    return res.status(400).json({
                        status: 400,
                        message: 'Email not accepted or not valid'
                    });
                }
            } catch (e) {
                console.log(e);
                return res.status(500).json({
                    status: 500,
                    message: 'Failed to check email status'
                });
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
            if (email === '' || password === '' || !email || !password) {
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

        const emailHtml = `<!DOCTYPE html> 
        <html>
            <center> 
                <h1>Reset Password For ${checkuser.username}</h1>
                <p>Click this link to reset your password, valid for 2 hours</p>
                <div>
                    <img src="https://res.cloudinary.com/dkxt6mlnh/image/upload/v1715693998/ta/tfohwr0b93k82g389azl.png" alt="Drown Logo" width="310" height="85">
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

        try {
            await mg.messages.create('mg.kuroshop.my.id', {
                from: "Kuro Gas Detect <mailgun@mg.kuroshop.my.id>",
                to: [email],
                subject: "Account Password Reset",
                text: "Request to reset password",
                html: emailHtml
            });

            return res.status(200).json({
                status: 200,
                message: 'Reset password email sent'
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                status: 500,
                message: 'Failed to send reset password email'
            });
        }
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