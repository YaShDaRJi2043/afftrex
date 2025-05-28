"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. Hash the password
    const password = await bcrypt.hash("admin123", 10);

    // 2. Find the super-admin role
    const [roles] = await queryInterface.sequelize.query(`
      SELECT id FROM roles WHERE name = 'super-admin' LIMIT 1;
    `);

    if (!roles.length) {
      throw new Error("Role 'super-admin' not found. Please seed roles first.");
    }

    const superAdminRoleId = roles[0].id;

    // 3. Insert the user
    await queryInterface.bulkInsert("users", [
      {
        name: "Super Admin",
        email: "superadmin@yopmail.com",
        password: password,
        role_id: superAdminRoleId,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users");
  },
};
