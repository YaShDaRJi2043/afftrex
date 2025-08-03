"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("campaigns", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "companies",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      objective: {
        type: Sequelize.ENUM(
          "conversions",
          "sale",
          "app_installs",
          "leads",
          "impressions",
          "clicks"
        ),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: Sequelize.TEXT,
      preview_url: Sequelize.STRING,
      defaultCampaignUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      defaultLandingPageName: {
        type: Sequelize.STRING,
        defaultValue: "Default",
      },
      enableTimeTargeting: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      timezone: {
        type: Sequelize.STRING,
        defaultValue: "GMT+05:30",
      },
      startHour: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      endHour: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      enableInactiveHours: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      activeDays: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      uniqueClickSessionDuration: {
        type: Sequelize.INTEGER,
        defaultValue: 24,
      },
      enableDuplicateClickAction: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      duplicateClickAction: {
        type: Sequelize.STRING,
        defaultValue: "blank_page",
      },
      enableCampaignSchedule: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      campaignStartDate: Sequelize.DATE,
      campaignEndDate: Sequelize.DATE,
      campaignStatus: {
        type: Sequelize.ENUM("active", "paused", "expired"),
        defaultValue: "active",
      },
      enableScheduleStatusChange: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      statusToBeSet: {
        type: Sequelize.ENUM("active", "paused"),
        defaultValue: "active",
      },
      scheduleDate: Sequelize.DATE,
      enablePublisherEmailNotify: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      publisherNotifyTime: Sequelize.DATE,
      appName: Sequelize.STRING,
      appId: Sequelize.STRING,
      erid: Sequelize.STRING,
      conversionFlow: Sequelize.TEXT,
      conversionFlowLanguages: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      unsubscribeUrl: Sequelize.STRING,
      suppressionUrl: Sequelize.STRING,
      enableDeepLink: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      conversionHoldPeriod: Sequelize.INTEGER,
      conversionStatusAfterHold: {
        type: Sequelize.ENUM("approved", "rejected", "pending"),
        defaultValue: "approved",
      },
      revenueModel: {
        type: Sequelize.ENUM("fixed", "revshare", "hybrid"),
        defaultValue: "fixed",
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: "INR",
      },
      defaultGoalName: Sequelize.STRING,
      revenue: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      payout: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      geoCoverage: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      category: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      devices: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      operatingSystem: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      carrierTargeting: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      allowedTrafficChannels: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      note: Sequelize.TEXT,
      termsAndConditions: Sequelize.TEXT,
      requireTermsAcceptance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      conversionTracking: {
        type: Sequelize.ENUM(
          "server_postback",
          "web_sdk",
          "iframe_pixel",
          "image_pixel"
        ),
        defaultValue: "server_postback",
      },
      primaryTrackingDomain: Sequelize.STRING,
      status: {
        type: Sequelize.ENUM("active", "pending", "paused"),
        defaultValue: "active",
      },
      redirectType: {
        type: Sequelize.STRING,
        defaultValue: "302",
      },
      visibility: {
        type: Sequelize.ENUM("public", "private", "ask_permission"),
        defaultValue: "public",
      },
      kpi: Sequelize.TEXT,
      externalOfferId: Sequelize.STRING,
      thumbnail: Sequelize.STRING,
      trackingDomain: Sequelize.STRING,
      trackingSlug: {
        type: Sequelize.STRING,
        unique: true,
      },
      trackingScript: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    await queryInterface.addIndex("campaigns", ["company_id"]);
    await queryInterface.addIndex("campaigns", ["status"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("campaigns");
  },
};
