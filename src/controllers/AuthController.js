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
                return res.status(400).json({message: 'Please fill all field'});
            }
            if (password !== repassword) {
                return res.status(400).json({message: 'Password not match'});
            }
        } catch (e) {
            return res.status(500).json({message: e.message});
        }

        const checkuser = await user.findOne({
            where: {
                email: email
            }
        });

        if (checkuser) {
            return res.status(400).json({message: 'Email already exist'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        try {
            const token = jwt.sign({email: email}, process.env.JWT_SECRET, {expiresIn: '2h'}, { algorithm: 'RS256' });

            await user.create({
                name: nama,
                email: email,
                password: hashPassword,
                status: "disabled",
                avatar: 'https://res.cloudinary.com/dkxt6mlnh/image/upload/v1682927959/drown/images-removebg-preview_nmbyo7.png',
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
                subject: 'Verify Email Sobermart',
                html: `<!DOCTYPE html>
<html>
    <center> 
        <h1>Email Verification For ${nama}</h1>
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
                    return res.status(500).json({message: err.message});
                } else {
                    return res.status(200).json({message: 'Email sent'});
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
                return res.status(400).json({message: 'Please fill all field'});
            }
        } catch (e) {
            return res.status(500).json({message: e.message});
        }

        const checkuser = await user.findOne({
            where: {
                email: email
            }
        });

        if (!checkuser) {
            return res.status(400).json({message: 'Email not found'});
        }

        const validPass = await bcrypt.compare(password, checkuser.password);

        if (!validPass) {
            return res.status(400).json({message: 'Password not match'});
        }

        const token = jwt.sign({id: checkuser.id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        return res.status(200).json({
            message: 'Login success',
            token: token
        });
    }
}