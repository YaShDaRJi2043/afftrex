"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CampaignAssignment extends Model {
    static associate(models) {
      CampaignAssignment.belongsTo(models.Campaign, {
        foreignKey: "campaignId",
        as: "campaign",
      });
      CampaignAssignment.belongsTo(models.Publisher, {
        foreignKey: "publisherId",
        as: "publisher",
      });
    }
  }

  CampaignAssignment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      publisherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      p1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      p2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      p3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      p4: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      publisherLink: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "pending"),
        defaultValue: "active",
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
      modelName: "CampaignAssignment",
      tableName: "campaign_assignments",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return CampaignAssignment;
};
