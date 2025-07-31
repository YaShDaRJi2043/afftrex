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
        allowNull: true,
        unique: true,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      referer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      device: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      os: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      browser: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      carrier: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      event_type: {
        type: Sequelize.ENUM("click", "impression", "conversion"),
        allowNull: false,
      },
      conversion_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      conversion_status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: true,
        defaultValue: "pending",
      },
      custom_params: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
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
