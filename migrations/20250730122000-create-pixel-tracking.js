"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("pixel_tracking", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Type of event (e.g., click, conversion)",
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Transaction ID for conversions",
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Campaign ID",
      },
      pub_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Publisher ID",
      },
      click_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Unique identifier for each click",
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
