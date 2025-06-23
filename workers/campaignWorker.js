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
    console.log(campaignId, statusToBeSet);

    try {
      await Campaign.update(
        {
          campaignStatus: statusToBeSet,
          enableScheduleStatusChange: false,
          statusToBeSet: null,
          scheduleDate: null,
        },
        { where: { id: campaignId } }
      );

      await redis.del(`campaign:schedule:${campaignId}`);

      console.log(
        `✅ Campaign ${campaignId} status changed to ${statusToBeSet}`
      );
    } catch (err) {
      console.error(`❌ Job failed for campaign ${campaignId}:`, err.message);
      throw err;
    }
  },
  { connection: redis }
);

worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(
    `❌ Job failed for campaign ${job?.data?.campaignId}:`,
    err.message
  );
});

worker.on("stalled", (jobId) => {
  console.warn(`⚠️ Job ${jobId} stalled`);
});

module.exports = worker;
