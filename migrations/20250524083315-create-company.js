"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("companies", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      admin_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subdomain: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subscription_type: {
        type: Sequelize.ENUM("free", "paid"),
        allowNull: false,
        defaultValue: "free",
      },
      subscription_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      subscription_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("companies");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_companies_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_companies_subscription_type";'
    );
  },
};
