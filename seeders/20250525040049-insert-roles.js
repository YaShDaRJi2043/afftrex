// seeders/2025XX-create-roles.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roles", [
      {
        name: "super-admin",
        level: 1,
        is_system_role: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "head-admin",
        level: 2,
        is_system_role: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "advertiser",
        level: 3,
        is_system_role: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "publisher",
        level: 3,
        is_system_role: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "viewer",
        level: 4,
        is_system_role: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
