"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CampaignAssignment extends Model {
    static associate(models) {
      CampaignAssignment.belongsTo(models.Campaign, {
        foreignKey: "campaignId",
        as: "campaign",
      });
    }
  }

  CampaignAssignment.init(
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
      publisherId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      trackingLink: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "pending"),
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "CampaignAssignment",
      tableName: "campaign_assignments",
      timestamps: true,
      underscored: true,
    }
  );

  return CampaignAssignment;
};
