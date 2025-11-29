"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("publishers", {
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
      username: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password_reset_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password_reset_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "Active",
          "Pending",
          "Disabled",
          "Rejected",
          "Banned"
        ),
        defaultValue: "Pending",
      },

      // Existing fields
      country: { type: Sequelize.STRING, allowNull: true },
      city: { type: Sequelize.STRING, allowNull: true },
      state: { type: Sequelize.STRING, allowNull: true },
      zip_code: { type: Sequelize.STRING, allowNull: true },
      phone: { type: Sequelize.STRING, allowNull: true },

      // Secondary fields
      country_secondary: { type: Sequelize.STRING, allowNull: true },
      city_secondary: { type: Sequelize.STRING, allowNull: true },
      state_secondary: { type: Sequelize.STRING, allowNull: true },
      zip_code_secondary: { type: Sequelize.STRING, allowNull: true },
      phone_secondary: { type: Sequelize.STRING, allowNull: true },

      // New fields
      company: { type: Sequelize.STRING, allowNull: true },
      microsoft_teams: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.STRING, allowNull: true },
      note: { type: Sequelize.TEXT, allowNull: true },

      entity_type: { type: Sequelize.STRING, allowNull: true },
      im_type: { type: Sequelize.STRING, allowNull: true },
      im_username: { type: Sequelize.STRING, allowNull: true },
      promotion_method: { type: Sequelize.STRING, allowNull: true },
      tax_id: { type: Sequelize.STRING, allowNull: true },
      referred_by: { type: Sequelize.STRING, allowNull: true },
      manager_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      tags: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true },
      last_login: { type: Sequelize.DATE, allowNull: true },
      notify: { type: Sequelize.BOOLEAN, defaultValue: false },

      companyName: { type: Sequelize.STRING, allowNull: true },
      companyAddress: { type: Sequelize.STRING, allowNull: true },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("publishers");
  },
};
