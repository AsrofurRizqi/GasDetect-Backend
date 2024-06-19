'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class nomor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'userId', as: 'nomor_notifikasi' });
    }
  }
  nomor.init({
    userId: DataTypes.UUID,
    nomor1: DataTypes.STRING,
    nomor2: DataTypes.STRING,
    nomor3: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'nomor',
  });
  return nomor;
};