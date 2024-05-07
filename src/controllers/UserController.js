const {
    user,
    Sequelize
} = require('../models');

const Op = Sequelize.Op;
const bcrypt = require('bcrypt');
const {v4: uuid} = require('uuid');

module.exports = {
    async getUserProfile(req, res) {
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

        return res.status(200).json({
            status: 200,
            message: 'User found',
            data: checkuser
        });
    },

    async changeUserProfile(req, res) {
        const {
            user_id,
            username,
            email,
            password
        } = req.body;

        if (req.file) {
            const avatar = req.file.path;
            try {

                const user = await user.findOne({
                    where: {
                        id: user_id
                    }
                });

                if (!user) {
                    return res.status(400).json({
                        message: 'User not found'
                    });
                }

                await user.update({
                    username: username,
                    email: email,
                    password: password,
                    profile_image: avatar
                }, {
                    where: {
                        id: user_id
                    }
                });

                return res.status(200).json({
                    status: 200,
                    message: 'User updated'
                });
            } catch (e) {
                return res.status(500).json({
                    status: 500,
                    message: e.message
                });
            }
        } else {
            try {
                const user = await user.findOne({
                    where: {
                        id: user_id
                    }
                });

                if (!user) {
                    return res.status(400).json({
                        message: 'User not found'
                    });
                }

                await user.update({
                    username: username,
                    email: email,
                    password: password
                }, {
                    where: {
                        id: user_id
                    }
                });

                return res.status(200).json({
                    status: 200,
                    message: 'User updated'
                });
            } catch (e) {
                return res.status(500).json({
                    status: 500,
                    message: e.message
                });
            }
        }
    },

    async getAllUser(req, res) {
        try {
            const users = await user.findAll();
            return res.status(200).json({
                status: 200,
                message: 'All users',
                data: users
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async deleteUser(req, res) {
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
            await user.destroy({
                where: {
                    id: user_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'User deleted'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async createUser(req, res) {
        const {
            username,
            email,
            password
        } = req.body;

        if (req.file) {
            const avatar = req.file.path;
            try {
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

                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);

                await user.create({
                    username: username,
                    email: email,
                    password: hash,
                    profile_image: avatar
                });

                return res.status(200).json({
                    status: 200,
                    message: 'User created'
                });
            } catch (e) {
                return res.status(500).json({
                    status: 500,
                    message: e.message
                });
            }
        } else {
            try {
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

                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);

                await user.create({
                    username: username,
                    email: email,
                    password: hash,
                    profile_image: 'assets/images/default-avatar.png'
                });

                return res.status(200).json({
                    status: 200,
                    message: 'User created'
                });
            } catch (e) {
                return res.status(500).json({
                    status: 500,
                    message: e.message
                });
            }
        }
    }
}