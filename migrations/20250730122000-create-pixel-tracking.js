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
      click_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Click ID to group clicks belonging to the same session",
      },
      page_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "URL of the page where the click occurred",
      },
      pixel_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "e.g., iframe, image, sdk",
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "e.g., conversion, lead, signup",
      },
      conversion_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Timestamp of the conversion event",
      },
      conversion_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: "Value associated with the conversion",
      },
      conversion_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      revenue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: "Revenue earned from this conversion",
      },
      payout: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: "Payout to publisher/partner",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "campaigns",
          key: "id",
        },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("pixel_tracking");
  },
};
