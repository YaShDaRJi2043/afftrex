require("module-alias/register");
const { Worker } = require("bullmq");
const Redis = require("ioredis");
const { Campaign } = require("@models/index");
const { redisConfigs } = require("@config/config");

const redis = new Redis({
  host: redisConfigs.redisHost,
  port: 19060,
  username: redisConfigs.redisUser,
  password: redisConfigs.redisPassword,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "campaign-schedule-queue",
  async (job) => {
    const { campaignId, statusToBeSet } = job.data;

    try {
      const campaign = await Campaign.findByPk(campaignId);
      if (!campaign) throw new Error("Campaign not found");

      campaign.campaignStatus = statusToBeSet;
      campaign.enableScheduleStatusChange = false;
      campaign.scheduledJobId = null;

      await campaign.save();

      await redis.del(`campaign:schedule:${campaignId}`);

      console.log(
        `✅ Campaign ${campaignId} status updated to ${statusToBeSet}`
      );
    } catch (err) {
      console.error(`❌ Job error for campaign ${campaignId}:`, err.message);
      throw err;
    }
  },
  { connection: redis }
);

// Log events
worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(
    `❌ Job failed for campaign ${job?.data?.campaignId || "unknown"}:`,
    err.message
  );
});

worker.on("stalled", (jobId) => {
  console.warn(`⚠️ Job ${jobId} stalled`);
});

module.exports = worker;
