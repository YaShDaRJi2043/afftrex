"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("companies", [
      {
        name: "Afftrex",
        admin_email: "superadmin@yopmail.com",
        subdomain: "afftrex",
        logo: null,
        subscription_type: "free",
        subscription_days: 30,
        subscription_start_date: null,
        amount: 0,
        status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "TechNova",
        admin_email: "technovaadmin@yopmail.com",
        subdomain: "technova",
        logo: null,
        subscription_type: "free",
        subscription_days: 30,
        subscription_start_date: null,
        amount: 0,
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "InnoCore",
        admin_email: "innorcoreadmin@yopmail.com",
        subdomain: "innocore",
        logo: null,
        subscription_type: "free",
        subscription_days: 30,
        subscription_start_date: null,
        amount: 0,
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("companies", null, {});
  },
};
