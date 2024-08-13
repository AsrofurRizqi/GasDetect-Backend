'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'userId', as: 'user_device' })
      this.hasMany(models.data, { foreignKey: 'deviceId', as: 'data_device' })
    }
  }
  device.init({
    userId: DataTypes.UUID,
    deviceNumber: DataTypes.INTEGER,
    deviceName: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    urlkey: DataTypes.STRING,
    interval: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'device',
  });
  return device;
};