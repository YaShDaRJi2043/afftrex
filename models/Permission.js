"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      this.belongsToMany(models.Role, {
        through: "role_permissions",
        foreignKey: "permission_id",
        otherKey: "role_id",
        as: "roles",
      });
    }
  }

  Permission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Permission",
      tableName: "permissions",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Permission;
};
