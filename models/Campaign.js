"use strict";
const { Model } = require("sequelize");
const { s3Bucket } = require("@root/config/config");

module.exports = (sequelize, DataTypes) => {
  class Campaign extends Model {
    static associate(models) {
      Campaign.belongsTo(models.Company, {
        foreignKey: "company_id",
        as: "company",
      });
      Campaign.hasMany(models.CampaignAssignment, {
        foreignKey: "campaignId",
        as: "assignments",
      });
      Campaign.hasMany(models.CampaignTracking, {
        foreignKey: "campaignId",
        as: "trackings",
      });
      Campaign.belongsTo(models.Advertiser, {
        foreignKey: "advertiser_id",
        as: "advertiser",
      });
    }
  }

  Campaign.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      advertiser_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      objective: {
        type: DataTypes.ENUM(
          "conversions",
          "sale",
          "app_installs",
          "leads",
          "impressions",
          "clicks"
        ),
        allowNull: false,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.TEXT,
      preview_url: DataTypes.STRING,
      defaultCampaignUrl: { type: DataTypes.TEXT, allowNull: false },
      defaultLandingPageName: {
        type: DataTypes.STRING,
        defaultValue: "Default",
      },
      enableTimeTargeting: { type: DataTypes.BOOLEAN, defaultValue: false },
      timezone: { type: DataTypes.STRING, defaultValue: "GMT+05:30" },
      startHour: { type: DataTypes.INTEGER, defaultValue: 0 },
      endHour: { type: DataTypes.INTEGER, defaultValue: 0 },
      enableInactiveHours: { type: DataTypes.BOOLEAN, defaultValue: false },
      activeDays: { type: DataTypes.JSON, defaultValue: [] },
      uniqueClickSessionDuration: { type: DataTypes.INTEGER, defaultValue: 24 },
      enableDuplicateClickAction: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      duplicateClickAction: {
        type: DataTypes.STRING,
        defaultValue: "blank_page",
      },
      enableCampaignSchedule: { type: DataTypes.BOOLEAN, defaultValue: false },
      campaignStartDate: DataTypes.DATE,
      campaignEndDate: DataTypes.DATE,
      campaignStatus: {
        type: DataTypes.ENUM("active", "paused", "expired"),
        defaultValue: "active",
      },
      enableScheduleStatusChange: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      statusToBeSet: {
        type: DataTypes.ENUM("active", "paused"),
        defaultValue: "active",
      },
      scheduleDate: DataTypes.DATE,
      enablePublisherEmailNotify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      publisherNotifyTime: DataTypes.DATE,
      appName: DataTypes.STRING,
      appId: DataTypes.STRING,
      erid: DataTypes.STRING,
      conversionFlow: DataTypes.TEXT,
      conversionFlowLanguages: { type: DataTypes.JSON, defaultValue: [] },
      unsubscribeUrl: DataTypes.STRING,
      suppressionUrl: DataTypes.STRING,
      enableDeepLink: { type: DataTypes.BOOLEAN, defaultValue: false },
      conversionHoldPeriod: DataTypes.INTEGER,
      conversionStatusAfterHold: {
        type: DataTypes.ENUM("approved", "rejected", "pending"),
        defaultValue: "approved",
      },
      revenueModel: {
        type: DataTypes.ENUM("fixed", "revshare", "hybrid"),
        defaultValue: "fixed",
      },
      currency: { type: DataTypes.STRING, defaultValue: "INR" },
      defaultGoalName: DataTypes.STRING,
      revenue: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      payout: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      geoCoverage: { type: DataTypes.JSON, defaultValue: [] },
      category: { type: DataTypes.JSON, defaultValue: [] },
      devices: { type: DataTypes.JSON, defaultValue: [] },
      operatingSystem: { type: DataTypes.JSON, defaultValue: [] },
      carrierTargeting: { type: DataTypes.JSON, defaultValue: [] },
      allowedTrafficChannels: { type: DataTypes.JSON, defaultValue: [] },
      note: DataTypes.TEXT,
      termsAndConditions: DataTypes.TEXT,
      requireTermsAcceptance: { type: DataTypes.BOOLEAN, defaultValue: false },
      conversionTracking: {
        type: DataTypes.ENUM(
          "server_postback",
          "web_sdk",
          "iframe_pixel",
          "image_pixel"
        ),
        defaultValue: "server_postback",
      },
      primaryTrackingDomain: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("active", "pending", "paused"),
        defaultValue: "active",
      },
      redirectType: { type: DataTypes.STRING, defaultValue: "302" },
      visibility: {
        type: DataTypes.ENUM("public", "private", "ask_permission"),
        defaultValue: "public",
      },
      kpi: DataTypes.TEXT,
      externalOfferId: DataTypes.STRING,
      thumbnail: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("thumbnail");
          if (!rawValue) return null;
          return `https://${s3Bucket.bucket}.s3.${s3Bucket.region}.amazonaws.com/${rawValue}`;
        },
        set(value) {
          this.setDataValue("thumbnail", value);
        },
      },
      trackingDomain: DataTypes.STRING,
      trackingSlug: { type: DataTypes.STRING, unique: true },
      trackingScript: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      unique_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: true,
        unique: true,
      },
      security_token: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        defaultValue: null,
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
      hidePayoutForPublisher: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "Campaign",
      tableName: "campaigns",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["company_id"] },
        { fields: ["status"] },
        { unique: true, fields: ["trackingSlug"] },
        { fields: ["advertiser_id"] },
      ],
    }
  );

  return Campaign;
};
