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
    }
  }
  device.init({
    userId: DataTypes.UUID,
    deviceNumber: DataTypes.INTEGER,
    deviceName: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    urlkey: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'device',
  });
  return device;
};