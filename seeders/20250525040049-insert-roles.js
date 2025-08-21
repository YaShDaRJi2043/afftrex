"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert("roles", [
      {
        name: "super-admin",
        level: 1,
        is_system_role: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "head-admin",
        level: 2,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "sub-admin",
        level: 3,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher",
        level: 4,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "advertiser",
        level: 4,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher Manager",
        level: 3,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "advertiser Manager",
        level: 3,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Operation Manager",
        level: 3,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Accountant",
        level: 5,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Analyst",
        level: 5,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "viewer",
        level: 5,
        is_system_role: false,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
