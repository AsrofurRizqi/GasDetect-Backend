'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        email: 'admin@gmail.com',
        password: bcrypt.hashSync('admin', 10),
        username: 'admin',
        phone: '081234567890',
        is_verified: true,
        is_activated: true,
        role: 'admin',
        profile_image: 'https://ui-avatars.com/api/?name=admin&size=256',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  },
};
