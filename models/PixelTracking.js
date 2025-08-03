"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PixelTracking extends Model {
    static associate(models) {
      PixelTracking.belongsTo(models.CampaignTracking, {
        foreignKey: "trackingId",
        as: "campaignTracking",
      });
    }
  }

  PixelTracking.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      trackingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      saleAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      p1: DataTypes.STRING,
      p2: DataTypes.STRING,
      p3: DataTypes.STRING,
      p4: DataTypes.STRING,

      clickTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      clickCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sessionId: DataTypes.STRING,
      pageUrl: DataTypes.TEXT,

      // 🔽 Additional fields
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      referrer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pixelType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "e.g., iframe, image, sdk",
      },
      eventType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "e.g., conversion, lead, signup",
      },
      conversionTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PixelTracking",
      tableName: "pixel_tracking",
      timestamps: true,
      underscored: true,
    }
  );

  return PixelTracking;
};
