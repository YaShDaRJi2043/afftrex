"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

    await queryInterface.bulkInsert("users", [
      {
        name: "Super Admin",
        email: "superadmin@yopmail.com",
        password: await bcrypt.hash("admin123", 10),
        role_id: roleMap["super-admin"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Alice Advertiser",
        email: "advertiser@yopmail.com",
        password: await bcrypt.hash("password123", 10),
        role_id: roleMap["advertiser"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Paul Publisher",
        email: "publisher@yopmail.com",
        password: await bcrypt.hash("password123", 10),
        role_id: roleMap["publisher"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Tom Team",
        email: "team@yopmail.com",
        password: await bcrypt.hash("password123", 10),
        role_id: roleMap["team-member"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Victor Viewer",
        email: "viewer@yopmail.com",
        password: await bcrypt.hash("password123", 10),
        role_id: roleMap["viewer"],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", {
      email: "superadmin@yopmail.com",
    });
  },
};
