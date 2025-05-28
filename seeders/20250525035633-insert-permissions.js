"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("permissions", [
      {
        name: "*",
        label: "Full Access",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "view_users",
        label: "View Users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "create_users",
        label: "Create Users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "edit_users",
        label: "Edit Users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "delete_users",
        label: "Delete Users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "manage_roles",
        label: "Manage Roles",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
