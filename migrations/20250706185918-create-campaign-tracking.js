"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("campaign_trackings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "campaigns",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      assignment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "campaign_assignments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      click_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      ip_address: {
        type: Sequelize.STRING,
      },
      user_agent: {
        type: Sequelize.TEXT,
      },
      referer: {
        type: Sequelize.TEXT,
      },
      country: {
        type: Sequelize.STRING,
      },
      region: {
        type: Sequelize.STRING,
      },
      city: {
        type: Sequelize.STRING,
      },
      device: {
        type: Sequelize.STRING,
      },
      os: {
        type: Sequelize.STRING,
      },
      browser: {
        type: Sequelize.STRING,
      },
      carrier: {
        type: Sequelize.STRING,
      },
      event_type: {
        type: Sequelize.ENUM("click", "impression", "conversion"),
        allowNull: false,
      },
      conversion_value: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      conversion_status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      custom_params: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("campaign_trackings");
  },
};
