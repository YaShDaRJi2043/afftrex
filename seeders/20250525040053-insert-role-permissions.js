"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = {
      "super-admin": ["*"],

      "head-admin": [
        "user_create_employee",
        "user_view_all",
        "user_view",
        "user_edit",
        "user_delete",
        "user_status_change",
        "advertiser_view_all",
        "advertiser_view",
        "advertiser_create",
        "advertiser_edit",
        "advertiser_delete",
        "advertiser_status_change",
        "publisher_view_all",
        "publisher_view",
        "publisher_create",
        "publisher_edit",
        "publisher_delete",
        "publisher_status_change",
        "campaign_create",
        "campaign_edit",
        "campaign_status_update",
        "campaign_delete",
        "campaign_update_tracking_script",
        "campaign_assign",
        "report_view_campaign_tracking",
        "report_view_conversion_tracking",
        "publisher_view_campaigns",
        "publisher_approve_for_campaign",
        "publisher_view_approved",
        "publisher_remove_approved",
      ],

      "sub-admin": [
        "user_view_all",
        "user_view",
        "user_edit",
        "user_status_change",
        "advertiser_view_all",
        "advertiser_view",
        "advertiser_edit",
        "advertiser_status_change",
        "publisher_view_all",
        "publisher_view",
        "publisher_edit",
        "publisher_view_approved",
        "publisher_remove_approved",
        "publisher_status_change",
        "campaign_create",
        "campaign_edit",
        "campaign_status_update",
        "campaign_assign",
        "report_view_campaign_tracking",
        "report_view_conversion_tracking",
      ],

      publisher: ["publisher_view_campaigns"],

      advertiser: [
        "campaign_create",
        "campaign_edit",
        "campaign_status_update",
        "campaign_delete",
        "campaign_update_tracking_script",
        "campaign_assign",
        "report_view_campaign_tracking",
        "report_view_conversion_tracking",
      ],

      "publisher Manager": [
        "publisher_view_all",
        "publisher_view",
        "publisher_create",
        "publisher_edit",
        "publisher_delete",
        "publisher_status_change",
        "publisher_view_campaigns",
        "publisher_approve_for_campaign",
        "publisher_view_approved",
        "publisher_remove_approved",
      ],

      "advertiser Manager": [
        "advertiser_view_all",
        "advertiser_view",
        "advertiser_create",
        "advertiser_edit",
        "advertiser_delete",
        "advertiser_status_change",
        "campaign_create",
        "campaign_edit",
        "campaign_status_update",
        "campaign_assign",
      ],

      "Operation Manager": [
        "campaign_create",
        "campaign_edit",
        "campaign_status_update",
        "campaign_assign",
        "publisher_view_campaigns",
        "publisher_approve_for_campaign",
        "report_view_campaign_tracking",
        "report_view_conversion_tracking",
      ],

      Accountant: [
        "report_view_campaign_tracking",
        "report_view_conversion_tracking",
      ],

      Analyst: [
        "report_view_campaign_tracking",
        "report_view_conversion_tracking",
      ],
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
        if (permissionMap[perm]) {
          inserts.push({
            role_id: roleMap[role],
            permission_id: permissionMap[perm],
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      });
    }

    await queryInterface.bulkInsert("role_permissions", inserts);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};
