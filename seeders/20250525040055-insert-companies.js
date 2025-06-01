"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("companies", [
      {
        name: "Afftrex",
        admin_email: "superadmin@yopmail.com",
        subdomain: "afftrex",
        logo: null,
        status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "TechNova",
        admin_email: "technovaadmin@yopmail.com",
        subdomain: "technova",
        logo: null,
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "InnoCore",
        admin_email: "innorcoreadmin@yopmail.com",
        subdomain: "innocore",
        logo: null,
        status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("companies");
  },
};
