"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class Publisher extends Model {
    static associate(models) {
      Publisher.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "companyInfo",
      });
    }

    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }

  Publisher.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "Full Name is required" } },
      },
      username: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Email is required" },
          isEmail: { msg: "Invalid email format" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Password is required" },
          len: {
            args: [6, 100],
            msg: "Password must be at least 6 characters",
          },
        },
      },
      password_reset_token: DataTypes.STRING,
      password_reset_expiry: DataTypes.DATE,
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

      // Existing fields
      country: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip_code: DataTypes.STRING,
      phone: DataTypes.STRING,

      // Secondary versions
      country_secondary: DataTypes.STRING,
      city_secondary: DataTypes.STRING,
      state_secondary: DataTypes.STRING,
      zip_code_secondary: DataTypes.STRING,
      phone_secondary: DataTypes.STRING,

      // New fields
      company: DataTypes.STRING,
      microsoft_teams: DataTypes.STRING,
      address: DataTypes.STRING,
      note: DataTypes.TEXT,

      entity_type: DataTypes.STRING,
      im_type: DataTypes.STRING,
      im_username: DataTypes.STRING,
      promotion_method: DataTypes.STRING,
      tax_id: DataTypes.STRING,
      referred_by: DataTypes.STRING,
      managers: DataTypes.STRING,
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      last_login: DataTypes.DATE,
      notify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      companyName: DataTypes.STRING,
      companyAddress: DataTypes.STRING,
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "companies", key: "id" },
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
      hooks: {
        beforeSave: async (publisher) => {
          if (publisher.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            publisher.password = await bcrypt.hash(publisher.password, salt);
          }
        },
      },
    }
  );

  return Publisher;
};
