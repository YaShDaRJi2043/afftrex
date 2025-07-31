"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CampaignTracking extends Model {
    static associate(models) {
      CampaignTracking.belongsTo(models.Campaign, {
        foreignKey: "campaignId",
        as: "campaign",
      });
      CampaignTracking.belongsTo(models.CampaignAssignment, {
        foreignKey: "assignmentId",
        as: "assignment",
      });
    }
  }

  CampaignTracking.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assignmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      clickId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      ipAddress: DataTypes.STRING,
      userAgent: DataTypes.TEXT,
      referer: DataTypes.TEXT,
      country: DataTypes.STRING,
      region: DataTypes.STRING,
      city: DataTypes.STRING,
      device: DataTypes.STRING,
      os: DataTypes.STRING,
      browser: DataTypes.STRING,
      carrier: DataTypes.STRING,
      eventType: {
        type: DataTypes.ENUM("click", "impression", "conversion"),
        allowNull: false,
      },
      conversionValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      conversionStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      customParams: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CampaignTracking",
      tableName: "campaign_trackings",
      timestamps: true,
      underscored: true,
    }
  );

  return CampaignTracking;
};
