const {
    user,
    Sequelize
} = require('../models');

const Op = Sequelize.Op;
const bcrypt = require('bcrypt');
const {v4: uuid} = require('uuid');

module.exports = {
    async getUserProfile(req, res) {
        const user_id = req.user.id;

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

        checkuser.password = undefined;

        return res.status(200).json({
            status: 200,
            message: 'User found',
            data: checkuser
        });
    },

    async changeUserProfile(req, res) {
        const {
            username,
            email,
            phone
        } = req.body;

        const user_id = req.user.id;

        if (req.file) {
            const avatar = req.file.path;
            try {

                const userData = await user.findOne({
                    where: {
                        id: user_id
                    }
                });

                if (!userData) {
                    return res.status(400).json({
                        message: 'User not found'
                    });
                }

                await userData.update({
                    username: username ? username : userData.username,
                    email: email ? email : userData.email,
                    phone: phone ? phone : userData.phone,
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
                const userData = await user.findOne({
                    where: {
                        id: user_id
                    }
                });

                if (!userData) {
                    return res.status(400).json({
                        message: 'User not found'
                    });
                }

                await userData.update({
                    username: username ? username : userData.username,
                    phone: phone ? phone : userData.phone,
                    email: email ? email : userData.email
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
            const users = await user.findAll({
                order: [
                    ['createdAt', 'ASC']
                ]
            });
            users.map((user) => {
                user.password = undefined;
            });
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
        const user_id = req.params.id;

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
            password,
            phone
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
                    id: uuid(),
                    username: username,
                    email: email,
                    password: hash,
                    profile_image: avatar,
                    role: 'user',
                    phone: phone,
                    is_verified: true,
                    is_activated: true
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
                    id: uuid(),
                    username: username,
                    email: email,
                    password: hash,
                    profile_image: 'assets/images/default-avatar.png',
                    role: 'user',
                    phone: phone,
                    is_activated: true,
                    is_verified: true
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
    },

    async activateUser(req, res) {
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
            await user.update({
                is_activated: true
            }, {
                where: {
                    id: user_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'User activated'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async deactivateUser(req, res) {
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
            await user.update({
                is_activated: false
            }, {
                where: {
                    id: user_id
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'User deactivated'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getUserById(req, res) {
        try {
            const user_id = req.params.id;

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

            checkuser.password = undefined;

            return res.status(200).json({
                status: 200,
                message: 'User found',
                data: checkuser
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async updateUserByAdmin(req, res) {
        const {
            username,
            email,
            phone,
            password
        } = req.body;

        const user_id = req.params.id;

        if (req.file) {
            const avatar = req.file.path;
            try {

                const userData = await user.findOne({
                    where: {
                        id: user_id
                    }
                });

                if (!userData) {
                    return res.status(400).json({
                        message: 'User not found'
                    });
                }

                await userData.update({
                    username: username ? username : userData.username,
                    email: email ? email : userData.email,
                    phone: phone ? phone : userData.phone,
                    profile_image: avatar,
                    password: password ? bcrypt.hashSync(password, bcrypt.genSaltSync(10)) : userData.password
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
                const userData = await user.findOne({
                    where: {
                        id: user_id
                    }
                });

                if (!userData) {
                    return res.status(400).json({
                        message: 'User not found'
                    });
                }

                await userData.update({
                    username: username ? username : userData.username,
                    phone: phone ? phone : userData.phone,
                    email: email ? email : userData.email,
                    password: password ? bcrypt.hashSync(password, bcrypt.genSaltSync(10)) : userData.password
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
    }
}