"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class Publisher extends Model {
    static associate(models) {
      Publisher.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
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
        unique: true,
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
      country: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip_code: DataTypes.STRING,
      phone: DataTypes.STRING,
      entity_type: DataTypes.STRING,
      im_type: DataTypes.STRING,
      im_username: DataTypes.STRING,
      promotion_method: DataTypes.STRING,
      reference_id: DataTypes.STRING,
      tax_id: DataTypes.STRING,
      referred_by: DataTypes.STRING,
      managers: DataTypes.STRING,
      signup_ip: DataTypes.STRING,
      currency: DataTypes.STRING,
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
