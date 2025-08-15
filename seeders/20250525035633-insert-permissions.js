// seeders/2025XX-create-permissions.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert("permissions", [
      {
        name: "campaign_create",
        label: "Create Campaign",
        created_at: now,
        updated_at: now,
      },
      {
        name: "campaign_edit",
        label: "Edit Campaign",
        created_at: now,
        updated_at: now,
      },
      {
        name: "campaign_status_update",
        label: "Update Campaign Status",
        created_at: now,
        updated_at: now,
      },
      {
        name: "campaign_delete",
        label: "Delete Campaign",
        created_at: now,
        updated_at: now,
      },
      {
        name: "campaign_update_tracking_script",
        label: "Update Campaign Tracking Script",
        created_at: now,
        updated_at: now,
      },
      {
        name: "campaign_assign",
        label: "Assign Campaign",
        created_at: now,
        updated_at: now,
      },
      {
        name: "company_approve",
        label: "Approve Company",
        created_at: now,
        updated_at: now,
      },
      {
        name: "company_reject",
        label: "Reject Company",
        created_at: now,
        updated_at: now,
      },
      {
        name: "company_list",
        label: "List Companies",
        created_at: now,
        updated_at: now,
      },
      {
        name: "company_extend_subscription",
        label: "Extend Company Subscription",
        created_at: now,
        updated_at: now,
      },
      {
        name: "company_send_subscription_reminder",
        label: "Send Company Subscription Reminder",
        created_at: now,
        updated_at: now,
      },
      {
        name: "permission_view_all",
        label: "View All Permissions",
        created_at: now,
        updated_at: now,
      },
      {
        name: "permission_view",
        label: "View Permission",
        created_at: now,
        updated_at: now,
      },
      {
        name: "permission_create",
        label: "Create Permission",
        created_at: now,
        updated_at: now,
      },
      {
        name: "permission_edit",
        label: "Edit Permission",
        created_at: now,
        updated_at: now,
      },
      {
        name: "permission_delete",
        label: "Delete Permission",
        created_at: now,
        updated_at: now,
      },
      {
        name: "role_view_all",
        label: "View All Roles",
        created_at: now,
        updated_at: now,
      },
      {
        name: "role_view",
        label: "View Role",
        created_at: now,
        updated_at: now,
      },
      {
        name: "role_create",
        label: "Create Role",
        created_at: now,
        updated_at: now,
      },
      {
        name: "role_edit",
        label: "Edit Role",
        created_at: now,
        updated_at: now,
      },
      {
        name: "role_delete",
        label: "Delete Role",
        created_at: now,
        updated_at: now,
      },
      {
        name: "report_view_campaign_tracking",
        label: "View Campaign Tracking Report",
        created_at: now,
        updated_at: now,
      },
      {
        name: "report_view_conversion_tracking",
        label: "View Conversion Tracking Report",
        created_at: now,
        updated_at: now,
      },
      {
        name: "user_create_employee",
        label: "Create Employee",
        created_at: now,
        updated_at: now,
      },
      {
        name: "user_view_all",
        label: "View All Users",
        created_at: now,
        updated_at: now,
      },
      {
        name: "user_view",
        label: "View User",
        created_at: now,
        updated_at: now,
      },
      {
        name: "user_edit",
        label: "Edit User",
        created_at: now,
        updated_at: now,
      },
      {
        name: "user_delete",
        label: "Delete User",
        created_at: now,
        updated_at: now,
      },
      {
        name: "user_status_change",
        label: "Change User Status",
        created_at: now,
        updated_at: now,
      },
      {
        name: "advertiser_view_all",
        label: "View All Advertisers",
        created_at: now,
        updated_at: now,
      },
      {
        name: "advertiser_view",
        label: "View Advertiser",
        created_at: now,
        updated_at: now,
      },
      {
        name: "advertiser_create",
        label: "Create Advertiser",
        created_at: now,
        updated_at: now,
      },
      {
        name: "advertiser_edit",
        label: "Edit Advertiser",
        created_at: now,
        updated_at: now,
      },
      {
        name: "advertiser_delete",
        label: "Delete Advertiser",
        created_at: now,
        updated_at: now,
      },
      {
        name: "advertiser_status_change",
        label: "Change Advertiser Status",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_view_all",
        label: "View All Publishers",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_view",
        label: "View Publisher",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_create",
        label: "Create Publisher",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_edit",
        label: "Edit Publisher",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_delete",
        label: "Delete Publisher",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_status_change",
        label: "Change Publisher Status",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_view_campaigns",
        label: "View Publisher Campaigns",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_approve_for_campaign",
        label: "Approve Publisher for Campaign",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_view_approved",
        label: "View Approved Publishers",
        created_at: now,
        updated_at: now,
      },
      {
        name: "publisher_remove_approved",
        label: "Remove Approved Publisher",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
