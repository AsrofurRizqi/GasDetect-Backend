'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.nomor, { foreignKey: 'userId', as: 'nomor_notifikasi' })
      this.hasMany(models.notification, { foreignKey: 'userId', as: 'user_notification' })
      this.hasMany(models.device, { foreignKey: 'userId', as: 'user_device' })
      this.hasMany(models.data, { foreignKey: 'userId', as: 'data_user' })
    }
  }
  user.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    username: DataTypes.STRING,
    phone: DataTypes.STRING,
    is_verified: DataTypes.BOOLEAN,
    is_activated: DataTypes.BOOLEAN,
    role: DataTypes.STRING,
    profile_image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};