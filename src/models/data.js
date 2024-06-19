'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'userId', as: 'data_user' })
      this.belongsTo(models.device, { foreignKey: 'deviceId', as: 'data_device' })
    }
  }
  data.init({
    userId: DataTypes.UUID,
    deviceId: DataTypes.UUID,
    timestamp: DataTypes.DATE,
    ppm: DataTypes.INTEGER,
    temperature: DataTypes.INTEGER,
    humidity: DataTypes.STRING,
    location: DataTypes.STRING,
    level: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'data',
  });
  return data;
};