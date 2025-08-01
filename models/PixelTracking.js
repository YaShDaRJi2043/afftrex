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
      sessionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pageUrl: {
        type: DataTypes.TEXT,
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
