"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ApprovedCampaignPublisher extends Model {
    static associate(models) {
      ApprovedCampaignPublisher.belongsTo(models.Campaign, {
        foreignKey: "campaign_id",
        as: "campaign",
      });
      ApprovedCampaignPublisher.belongsTo(models.Publisher, {
        foreignKey: "publisher_id",
        as: "publisher",
      });
    }
  }

  ApprovedCampaignPublisher.init(
    {
      campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "campaigns", key: "id" },
      },
      publisher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "publishers", key: "id" },
      },
      approved_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ApprovedCampaignPublisher",
      tableName: "approved_campaign_publishers",
      timestamps: false,
    }
  );

  return ApprovedCampaignPublisher;
};
