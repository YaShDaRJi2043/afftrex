"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Publisher extends Model {
    static associate(models) {
      Publisher.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });
    }
  }

  Publisher.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Full Name is required" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Email is required" },
          isEmail: { msg: "Invalid email format" },
        },
      },
      status: {
        type: DataTypes.ENUM(
          "Active",
          "Pending",
          "Disabled",
          "Rejected",
          "Banned"
        ),
        defaultValue: "Pending",
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      zip_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      entity_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      im_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      im_username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      promotion_method: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notify_by_email: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      signup_company_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      signup_company_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "companies",
          key: "id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Publisher",
      tableName: "publishers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Publisher;
};
