// seeders/2025XX-role-permission-mapping.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = {
      "super-admin": ["*"],
      advertiser: [
        "view_own_analytics",
        "create_campaigns",
        "edit_campaigns",
        "upload_creatives",
        "set_budget_targeting",
        "create_postbacks",
        "view_ai_insights",
      ],
      publisher: [
        "view_assigned_campaigns",
        "generate_tracking_links",
        "view_reports",
        "view_conversions",
        "request_campaign_access",
        "setup_postback_url",
      ],
      "head-admin": [
        "manage_users",
        "manage_publishers",
        "manage_advertiser",
        "moderate_fraud_logs",
        "manage_campaigns",
        "approve_requests",
      ],
      viewer: ["view_campaigns", "view_reports", "view_fraud_review"],
    };

    const permissionRecords = await queryInterface.sequelize.query(
      `SELECT id, name FROM permissions`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const roleRecords = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissionMap = Object.fromEntries(
      permissionRecords.map((p) => [p.name, p.id])
    );
    const roleMap = Object.fromEntries(roleRecords.map((r) => [r.name, r.id]));

    const inserts = [];

    for (const [role, perms] of Object.entries(roles)) {
      perms.forEach((perm) => {
        inserts.push({
          role_id: roleMap[role],
          permission_id: permissionMap[perm],
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    }

    await queryInterface.bulkInsert("role_permissions", inserts);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};
