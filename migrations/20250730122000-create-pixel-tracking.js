"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("pixel_tracking", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tracking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "campaign_trackings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "FK to campaign_trackings",
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Transaction ID for conversions",
      },
      sale_amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: "Sale amount for conversions",
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Currency of the sale",
      },
      p1: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Custom parameter 1",
      },
      p2: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Custom parameter 2",
      },
      p3: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Custom parameter 3",
      },
      p4: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Custom parameter 4",
      },
      click_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "Timestamp of the click",
      },
      click_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Count of clicks by the user on the website",
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment:
          "Session ID to group clicks belonging to the same user session",
      },
      page_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "URL of the page where the click occurred",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("pixel_tracking");
  },
};
