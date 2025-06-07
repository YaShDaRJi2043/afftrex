// seeders/2025XX-create-permissions.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("permissions", [
      {
        name: "*",
        label: "Full Access",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "manage_users",
        label: "Manage Users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "manage_roles",
        label: "Manage Roles",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "view_own_analytics",
        label: "View Own Analytics",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "create_campaigns",
        label: "Create Campaigns",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "edit_campaigns",
        label: "Edit Campaigns",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "upload_creatives",
        label: "Upload Creatives",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "set_budget_targeting",
        label: "Set Budget & Targeting",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "create_postbacks",
        label: "Create Postback URLs",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "view_ai_insights",
        label: "View AI Insights",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "view_assigned_campaigns",
        label: "View Assigned Campaigns",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "generate_tracking_links",
        label: "Generate Tracking Links",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "view_reports",
        label: "View Reports",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "view_conversions",
        label: "View Conversions",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "request_campaign_access",
        label: "Request Campaign Access",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "setup_postback_url",
        label: "Setup Postback URL",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "manage_publishers",
        label: "Manage Publishers",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "manage_advertiser",
        label: "Manage Advertiser",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "moderate_fraud_logs",
        label: "Moderate Fraud Logs",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "review_campaigns",
        label: "Review Campaigns",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "approve_requests",
        label: "Approve Publisher Requests",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "view_campaigns",
        label: "View Campaigns",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "view_fraud_review",
        label: "View Fraud Review",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
