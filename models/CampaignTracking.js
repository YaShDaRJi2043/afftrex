"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CampaignTracking extends Model {
    static associate(models) {
      CampaignTracking.belongsTo(models.Campaign, {
        foreignKey: "campaignId",
        as: "campaign",
      });
      CampaignTracking.belongsTo(models.Publisher, {
        foreignKey: "publisherId",
        as: "publisher",
      });
      CampaignTracking.hasMany(models.PixelTracking, {
        foreignKey: "trackingId",
        as: "pixelTrackings",
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
      publisherId: {
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
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
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
