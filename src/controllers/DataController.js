const {
    data,
    Sequelize,
    user,
    nomor,
    notification
} = require('../models');

const Op = Sequelize.Op;
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendMessage } = require('../auto/SendMessage');

function groupLocations(data) {
    const threshold = 0.002; 
    const groupedData = [];
  
    data.forEach(item => {
      const locationArray = item.location.split(",").map(Number); 
      const existingGroup = groupedData.find(group => {
        const latDiff = Math.abs(group.location[0] - locationArray[0]);
        const lonDiff = Math.abs(group.location[1] - locationArray[1]);
        return latDiff < threshold && lonDiff < threshold;
      });
  
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        groupedData.push({ location: locationArray, items: [item] });
      }
    });
  
    // Optional: Sort the groups by location if needed
    // groupedData.sort((a, b) => a.location[0] - b.location[0]);
  
    return groupedData;
  }

module.exports = {
    // admin
    async getAllData(req, res) {
        try {
            const dataAll = await data.findAll({
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return res.status(200).json({
                status: 200,
                message: 'Data found',
                data: dataAll,
            });
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDataByDateRange(req, res) {
        const {
            start_date,
            end_date
        } = req.body;

        const user_id = req.user.id;

        try {
            if (start_date === '' || end_date === '') {
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
            const dataByDate = await data.findAll({
                where: {
                    userId: user_id,
                    createdAt: {
                        [Op.between]: [start_date, end_date]
                    }
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return res.status(200).json({
                status: 200,
                message: 'Data found',
                data: dataByDate,
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDataByIdDevice(req, res) {
        const user_id = req.user.id;
        const deviceId = req.params.device_id;

        try {
            if (deviceId === '') {
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
            const dataById = await data.findAll({
                where: {
                    userId: user_id,
                    deviceId: deviceId
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return res.status(200).json({
                status: 200,
                message: 'Data found',
                data: dataById,
            });
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async insertDataDevice(req, res) {
        const {
            timestamp,
            ppm,
            temperature,
            humidity,
            latitude,
            longitude,
            level,
        } = req.body;

        console.log(req.body)

        const {
            userId,
            id
        } = req.device;

        try {
            if (timestamp === '' || ppm === '' || temperature === '' || humidity === '' || latitude === '' || longitude === '' || level === '') {
                return res.status(400).json({
                    status: 400,
                    message: 'Please fill all data field'
                });
            }
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }

        try {
            let status
            if (level == 0) {
                status = 'Normal'
            }
            else if (level == 1) {
                status = 'Warning'
            }
            else if (level == 2) {
                status = 'Danger'
            } else if (level == 3) {
                status = 'Critical'
            }

            if (level >= 1) {
                const nomor = await nomor.findOne({
                    where: {
                        userId: userId
                    }
                });

                if (nomor) {
                    const message = `Device ${id} has ${status} level. Please check the device immediately on location ${latitude},${longitude}`;
                    await sendMessage(nomor.nomor1, message);
                }

                await notification.create({
                    id: uuidv4(),
                    userId: userId,
                    status: status,
                    level: level,
                    location: `${latitude},${longitude}`
                });

            } 

            await data.create({
                id: uuidv4(),
                userId: userId,
                deviceId: id,
                timestamp: timestamp,
                ppm: ppm,
                temperature: temperature,
                humidity: humidity,
                location: `${latitude},${longitude}`,
                level: level,
                status: status
            });

            return res.status(201).json({
                status: 201,
                message: 'Data saved'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async insertDataAdmin(req, res) {
        const {
            suhu,
            kelembapan,
            ph,
            turbidity,
            userId,
            deviceId
        } = req.body;

        try {
            if (suhu === '' || kelembapan === '' || ph === '' || turbidity === '' || userId === '' || deviceId === '') {
                return res.status(400).json({
                    status: 400,
                    message: 'Please fill all field'
                });
            }
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }

        const checkuser = await user.findOne({
            where: {
                id: userId
            }
        });

        if (!checkuser) {
            return res.status(400).json({
                status: 400,
                message: 'User not found'
            });
        }

        try {

            await data.create({
                id: uuidv4(),
                suhu: suhu,
                kelembapan: kelembapan,
                ph: ph,
                turbidity: turbidity,
                userId: userId,
                deviceId: deviceId
            });

            return res.status(201).json({
                status: 201,
                message: 'Data saved'
            });
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async deleteDataByDateRange(req, res) {
        const {
            deviceId,
            start_date,
            end_date
        } = req.body;

        const user_id = req.user.id;

        try {
            if (deviceId === '' || start_date === '' || end_date === '') {
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
            await data.destroy({
                where: {
                    userId: user_id,
                    deviceId: deviceId,
                    createdAt: {
                        [Op.between]: [start_date, end_date]
                    }
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Data deleted'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async deleteAllDataByDeviceId(req, res) {
        const {
            deviceId
        } = req.body;

        const user_id = req.user.id;

        try {
            if (deviceId === '') {
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
            await data.destroy({
                where: {
                    userId: user_id,
                    deviceId: deviceId
                }
            });

            return res.status(200).json({
                status: 200,
                message: 'Data deleted'
            });
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },
    // user
    async getData(req, res) {
        const user_id = req.user.id;

        try {
            const dataByUser = await data.findAndCountAll({
                where: {
                    userId: user_id
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return res.status(200).json({
                status: 200,
                message: 'Data found',
                data: dataByUser
            });
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDataByUserId(req, res) {
        const user_id = req.params.user_id;

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

        try {
            const dataByUser = await data.findAll({
                where: {
                    userId: user_id
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            if (!dataByUser) {
                return res.status(400).json({
                    status: 400,
                    message: 'Data not found'
                });
            } else {
                return res.status(200).json({
                    status: 200,
                    message: 'Data found',
                    data: dataByUser,
                });
            }
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDataByDeviceId(req, res) {
        const deviceId = req.params.device_id;

        try {
            if (deviceId === '') {
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
            const dataByDevice = await data.findAll({
                where: {
                    deviceId: deviceId
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            if (!dataByDevice) {
                return res.status(400).json({
                    status: 400,
                    message: 'Data not found'
                });
            } else {
                const groupedData = groupLocations(dataByDevice); 
                return res.status(200).json({
                    status: 200,
                    message: 'Data found',
                    data: groupedData,
                });
            }
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDataAllLocation(req, res) {
        const user_id = req.user.id;

        try {
            const dataByDevice = await data.findAll({
                where: {
                    userId: user_id,
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            if (!dataByDevice) {
                return res.status(400).json({
                    status: 400,
                    message: 'Data not found'
                });
            } else {
                const groupedData = groupLocations(dataByDevice); 
                groupedData.forEach(group => delete group.items);
                return res.status(200).json({
                    status: 200,
                    message: 'Data found',
                    data: groupedData,
                });
            }
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    },

    async getDataDetails(req, res) {
        const data_id = req.params.data_id;

        try {
            if (data_id === '') {
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
            const dataDetails = await data.findOne({
                where: {
                    id: data_id
                }
            });

            if (!dataDetails) {
                return res.status(400).json({
                    status: 400,
                    message: 'Data not found'
                });
            } else {
                return res.status(200).json({
                    status: 200,
                    message: 'Data found',
                    data: dataDetails,
                });
            }
        }
        catch (e) {
            return res.status(500).json({
                status: 500,
                message: e.message
            });
        }
    }
}