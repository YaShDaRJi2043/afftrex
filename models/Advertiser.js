"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class Advertiser extends Model {
    static associate(models) {
      Advertiser.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });
      Advertiser.hasMany(models.Campaign, {
        foreignKey: "advertiser_id",
        as: "campaigns",
      });
    }

    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }

  Advertiser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
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
      password_reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password_reset_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "Active",
          "Pending",
          "Disabled",
          "Rejected",
          "Banned"
        ),
        allowNull: false,
        defaultValue: "Pending",
      },
      reference_id: DataTypes.STRING,
      managers: DataTypes.STRING,
      country: DataTypes.STRING,
      state: DataTypes.STRING,
      city: DataTypes.STRING,
      currency: DataTypes.STRING,
      website_url: DataTypes.STRING,
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      phone: DataTypes.STRING,
      entity_type: DataTypes.STRING,
      notes: DataTypes.TEXT,
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "companies",
          key: "id",
        },
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
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
      modelName: "Advertiser",
      tableName: "advertisers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeSave: async (advertiser) => {
          if (advertiser.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            advertiser.password = await bcrypt.hash(advertiser.password, salt);
          }
        },
      },
    }
  );

  return Advertiser;
};
