"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Query permission ID for permission with name "*"
    const [results] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE name = '*' LIMIT 1`
    );

    const permissionId = results.length ? results[0].id : null;

    await queryInterface.bulkInsert("roles", [
      {
        name: "super-admin",
        level: 1,
        permissions_id: permissionId ? [permissionId] : [],
        is_system_role: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("roles");
  },
};
