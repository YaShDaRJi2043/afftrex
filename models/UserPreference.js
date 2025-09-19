"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserPreference extends Model {
    static associate(models) {
      UserPreference.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  UserPreference.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      form: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fields: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "UserPreference",
      tableName: "user_preferences",
      underscored: true,
    }
  );

  return UserPreference;
};
