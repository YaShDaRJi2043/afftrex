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
      clickId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Click ID to group clicks belonging to the same session",
      },
      pageUrl: DataTypes.TEXT,
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
      conversionValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      conversionStatus: {
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
      modelName: "PixelTracking",
      tableName: "pixel_tracking",
      timestamps: true,
      underscored: true,
    }
  );

  return PixelTracking;
};
