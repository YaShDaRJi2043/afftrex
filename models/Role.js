"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, {
        foreignKey: "role_id",
        as: "users",
      });

      Role.belongsToMany(models.Permission, {
        through: "role_permissions",
        foreignKey: "role_id",
        otherKey: "permission_id",
        as: "permissions",
      });
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Lower number = higher rank",
      },
      is_system_role: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Prevent delete of system roles",
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
      modelName: "Role",
      tableName: "roles",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Role;
};
