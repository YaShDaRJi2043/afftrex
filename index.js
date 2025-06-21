require("module-alias/register");
require("dotenv").config();

const app = require("@root/app");
const config = require("@config/config");
const { updateScheduledCampaignStatuses } = require("@helper/campaignHelpers");
require("@models");

// Start server
const port = config.serverInfo.port;
app.listen(port, async () => {
  console.log(`Server started on port ${port}`);
  await updateScheduledCampaignStatuses();
  console.log("✅ Checked and queued overdue campaigns from DB");
});
