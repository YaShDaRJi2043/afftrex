"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmailTemplate extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  EmailTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Slug is required" },
          isLowercase: { msg: "Slug must be lowercase" },
        },
        set(value) {
          this.setDataValue("slug", value ? value.toLowerCase().trim() : value);
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Name is required" },
        },
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Subject is required" },
        },
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Body is required" },
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      modelName: "EmailTemplate",
      tableName: "email_templates",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return EmailTemplate;
};
