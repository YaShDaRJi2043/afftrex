"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("cliksv2", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      click_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: "Unique identifier for each click",
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Type of event (e.g., click, conversion)",
      },
      pub_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Publisher ID",
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Campaign ID",
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
    await queryInterface.dropTable("cliksv2");
  },
};
