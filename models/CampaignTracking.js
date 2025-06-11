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
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      campaignId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      assignmentId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      clickId: {
        type: DataTypes.STRING,
        unique: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
      },
      userAgent: {
        type: DataTypes.TEXT,
      },
      referer: {
        type: DataTypes.TEXT,
      },
      country: {
        type: DataTypes.STRING,
      },
      region: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
      },
      device: {
        type: DataTypes.STRING,
      },
      os: {
        type: DataTypes.STRING,
      },
      browser: {
        type: DataTypes.STRING,
      },
      carrier: {
        type: DataTypes.STRING,
      },
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
