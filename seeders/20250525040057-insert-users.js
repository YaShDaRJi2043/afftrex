"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

    const companies = await queryInterface.sequelize.query(
      `SELECT id, subdomain FROM companies`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const companyMap = Object.fromEntries(
      companies.map((c) => [c.subdomain, c.id])
    );

    await queryInterface.bulkInsert("users", [
      {
        name: "Super Admin",
        email: "superadmin@yopmail.com",
        password: await bcrypt.hash("admin123", 10),
        number: "9999999999",
        status: "Active",
        last_login: null,
        role_id: roleMap["super-admin"],
        company_id: companyMap["afftrex"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Alice Advertiser",
        email: "advertiser@yopmail.com",
        password: await bcrypt.hash("password123", 10),
        number: "8888888888",
        status: "Active",
        last_login: null,
        role_id: roleMap["advertiser"],
        company_id: companyMap["technova"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Paul Publisher",
        email: "publisher@yopmail.com",
        password: await bcrypt.hash("password123", 10),
        number: "7777777777",
        status: "Active",
        last_login: null,
        role_id: roleMap["publisher"],
        company_id: companyMap["innocore"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Tom Team",
        email: "team@yopmail.com",
        password: await bcrypt.hash("password123", 10),
        number: "6666666666",
        status: "Active",
        last_login: null,
        role_id: roleMap["publisher"],
        company_id: companyMap["technova"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Victor Viewer",
        email: "viewer@yopmail.com",
        password: await bcrypt.hash("password123", 10),
        number: "5555555555",
        status: "Active",
        last_login: null,
        role_id: roleMap["viewer"],
        company_id: companyMap["innocore"],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
